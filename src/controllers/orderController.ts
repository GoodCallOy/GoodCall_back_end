import { Request, Response } from 'express'
import { Types } from 'mongoose';
import Order from '../models/orders'
import User from '../models/user';
import gcAgent from '../models/gcAgent';

type AgentOrderRow = {
  orderId: string;
  caseId: string;
  caseName: string;
  goal: number;
  pricePerUnit: number;
  revenue: number;
  startDate: Date;
  deadline: Date;
};

type AgentBucket = {
  agentId: string;
  agentName: string;
  totalRevenue: number;
  orders: AgentOrderRow[];
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find()
    res.status(200).json(orders)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
      const order = await Order.findById(req.params.id)
      if (!order) return res.status(404).json({ message: 'order not found' })

      const data = order.toObject()
      // aliases/output helpers expected by frontend
      ;(data as any).enableSearchedPhoneNumbers = Boolean((data as any).searchedPhoneNumbers)
      ;(data as any).startDateISO = data.startDate ? new Date(data.startDate).toISOString() : null
      ;(data as any).deadlineISO = data.deadline ? new Date(data.deadline).toISOString() : null
      // Remove the original field to avoid confusion
      delete (data as any).searchedPhoneNumbers

      console.log('Fetched order by id:', JSON.stringify(data))
      res.json(data)
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch order', error: err })
    }
}

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    console.log('Creating order with data:', req.body)
    
    // Parse assignedCallers - handle both string and array formats
    let assignedCallers: Types.ObjectId[] = []
    if (req.body.assignedCallers) {
      if (typeof req.body.assignedCallers === 'string') {
        try {
          // Parse the stringified JSON array
          const parsedCallers = JSON.parse(req.body.assignedCallers)
          if (Array.isArray(parsedCallers)) {
            // Extract ObjectIds from the parsed array
            assignedCallers = parsedCallers
              .map((caller: any) => {
                if (typeof caller === 'string') {
                  return new Types.ObjectId(caller)
                } else if (caller && typeof caller === 'object' && caller.id) {
                  return new Types.ObjectId(caller.id)
                }
                return null
              })
              .filter((id: Types.ObjectId | null) => id !== null) as Types.ObjectId[]
          }
        } catch (parseError) {
          console.error('Error parsing assignedCallers:', parseError)
          return res.status(400).json({
            message: 'Invalid assignedCallers format. Expected array of agent IDs.'
          })
        }
      } else if (Array.isArray(req.body.assignedCallers)) {
        // Handle direct array format
        assignedCallers = req.body.assignedCallers
          .map((caller: any) => {
            if (typeof caller === 'string') {
              return new Types.ObjectId(caller)
            } else if (caller && typeof caller === 'object' && caller.id) {
              return new Types.ObjectId(caller.id)
            }
            return caller // Assume it's already an ObjectId
          })
          .filter((id: any) => id instanceof Types.ObjectId) as Types.ObjectId[]
      }
    }

    // Handle optional managers field - accept array of { id, name } or ids
    const orderData: any = {
      caseId: req.body.caseId,
      caseName: req.body.caseName,
      caseUnit: req.body.caseUnit,
      pricePerUnit: req.body.pricePerUnit,
      totalQuantity: req.body.totalQuantity,
      campaignGoal: req.body.campaignGoal ?? 0,
      startDate: req.body.startDate || new Date(), // Default to current date if not provided
      deadline: req.body.deadline,
      orderStatus: req.body.orderStatus || 'pending',
      caseType: req.body.caseType,
      ProjectManagmentFee: req.body.ProjectManagmentFee ?? 0,
      ProjectStartFee: req.body.ProjectStartFee ?? 0,
      estimatedRevenue: req.body.estimatedRevenue,
      assignedCallers: assignedCallers,
      agentGoals: req.body.agentGoals || {},
      agentsPrice: req.body.agentPrices || {},
      searchedPhoneNumbers: Boolean(req.body.searchedPhoneNumbers) === true
    }
    if (req.body.managers) {
      if (Array.isArray(req.body.managers)) {
        orderData.managers = req.body.managers
          .map((m: any) => (typeof m === 'string' ? m : m?.id))
          .filter((id: any) => !!id)
          .map((id: string) => new Types.ObjectId(id));
      } else if (typeof req.body.managers === 'string') {
        try {
          const parsed = JSON.parse(req.body.managers);
          if (Array.isArray(parsed)) {
            orderData.managers = parsed
              .map((m: any) => (typeof m === 'string' ? m : m?.id))
              .filter((id: any) => !!id)
              .map((id: string) => new Types.ObjectId(id));
          }
        } catch {}
      }
    }

    // Normalize agent assignments
    const incomingGoals: Record<string, number> = req.body.agentGoals || {}
    const incomingRates: Record<string, number> = (req.body.agentRates || req.body.agentPrices || {})
    const incomingAssignments: Array<any> = Array.isArray(req.body.agentAssignments) ? req.body.agentAssignments : []

    const unionIds = new Set<string>([
      ...assignedCallers.map(id => String(id)),
      ...Object.keys(incomingGoals || {}),
      ...Object.keys(incomingRates || {}),
      ...incomingAssignments.map(a => String(a?.id)).filter(Boolean),
    ])

    // helper to optionally lookup name later if needed
    const lookupNames = async (ids: string[]) => {
      const userDocs = await gcAgent.find({ _id: { $in: ids.map(id => new Types.ObjectId(id)) } }).select('name firstName lastName').lean()
      const map = new Map<string, string>()
      for (const u of userDocs as any[]) {
        const nm = u.name || [u.firstName, u.lastName].filter(Boolean).join(' ')
        map.set(String(u._id), nm)
      }
      return map
    }

    const idsArray = Array.from(unionIds)
    const nameById = await lookupNames(idsArray)

    const normalizedAssignments = idsArray.map(id => {
      const fromArray = incomingAssignments.find(a => String(a?.id) === id) || {}
      const name = fromArray.name || nameById.get(id) || ''
      const goal = Number(fromArray.goal ?? (incomingGoals?.[id])) || 0
      const rate = Number(fromArray.rate ?? (incomingRates?.[id])) || 0
      return { id, name, goal, rate }
    })

    // rebuild mirrors
    const normalizedGoals = Object.fromEntries(normalizedAssignments.map(a => [a.id, a.goal]))
    const normalizedRates = Object.fromEntries(normalizedAssignments.map(a => [a.id, a.rate]))

    const newOrder = new Order({
      ...orderData,
      agentAssignments: normalizedAssignments,
      agentGoals: normalizedGoals,
      agentRates: normalizedRates,
    })

    await newOrder.save()
    res.status(200).json({
      message: 'Order created successfully',
      order: newOrder
    })
  } catch (err: any) {
    console.error('Error creating order:', err.message)
    res.status(400).json({
      message: err.message
    })
  }
}

// Update an order
export const updateOrder = async (req: Request, res: Response) => {
  const orderId = req.params.id
  const updatedData = { ...req.body }
  // normalize booleans and dates for update
  if (updatedData.searchedPhoneNumbers !== undefined) {
    updatedData.searchedPhoneNumbers = Boolean(updatedData.searchedPhoneNumbers) === true
  }
  if (typeof updatedData.startDate === 'string') {
    updatedData.startDate = new Date(updatedData.startDate)
  }
  if (typeof updatedData.deadline === 'string') {
    updatedData.deadline = new Date(updatedData.deadline)
  }
  if (updatedData.campaignGoal !== undefined) {
    updatedData.campaignGoal = Number(updatedData.campaignGoal)
  }

  try {
    // Parse assignedCallers - handle both string and array formats (same logic as createOrder)
    if (updatedData.assignedCallers) {
      let assignedCallers: Types.ObjectId[] = []
      
      if (typeof updatedData.assignedCallers === 'string') {
        try {
          // Parse the stringified JSON array
          const parsedCallers = JSON.parse(updatedData.assignedCallers)
          if (Array.isArray(parsedCallers)) {
            // Extract ObjectIds from the parsed array
            assignedCallers = parsedCallers
              .map((caller: any) => {
                if (typeof caller === 'string') {
                  return new Types.ObjectId(caller)
                } else if (caller && typeof caller === 'object' && caller.id) {
                  return new Types.ObjectId(caller.id)
                }
                return null
              })
              .filter((id: Types.ObjectId | null) => id !== null) as Types.ObjectId[]
          }
        } catch (parseError) {
          console.error('Error parsing assignedCallers:', parseError)
          return res.status(400).json({
            message: 'Invalid assignedCallers format. Expected array of agent IDs.'
          })
        }
      } else if (Array.isArray(updatedData.assignedCallers)) {
        // Handle direct array format
        assignedCallers = updatedData.assignedCallers
          .map((caller: any) => {
            if (typeof caller === 'string') {
              return new Types.ObjectId(caller)
            } else if (caller && typeof caller === 'object' && caller.id) {
              return new Types.ObjectId(caller.id)
            }
            return caller // Assume it's already an ObjectId
          })
          .filter((id: any) => id instanceof Types.ObjectId) as Types.ObjectId[]
      }
      
      // Update the assignedCallers with properly converted ObjectIds
      updatedData.assignedCallers = assignedCallers
    }

    // Normalize managers in update payload
    if (updatedData.managers !== undefined) {
      if (!updatedData.managers) {
        delete (updatedData as any).managers;
      } else if (Array.isArray(updatedData.managers)) {
        (updatedData as any).managers = updatedData.managers
          .map((m: any) => (typeof m === 'string' ? m : m?.id))
          .filter((id: any) => !!id)
          .map((id: string) => new Types.ObjectId(id));
      } else if (typeof updatedData.managers === 'string') {
        try {
          const parsed = JSON.parse(updatedData.managers);
          if (Array.isArray(parsed)) {
            (updatedData as any).managers = parsed
              .map((m: any) => (typeof m === 'string' ? m : m?.id))
              .filter((id: any) => !!id)
              .map((id: string) => new Types.ObjectId(id));
          }
        } catch {}
      }
    }

    // Normalize agent assignments on update as well
    const incomingGoals: Record<string, number> = updatedData.agentGoals || {}
    const incomingRates: Record<string, number> = (updatedData.agentRates || updatedData.agentPrices || {})
    const incomingAssignments: Array<any> = Array.isArray(updatedData.agentAssignments) ? updatedData.agentAssignments : []

    const current = await Order.findById(orderId).select('assignedCallers').lean()
    const assignedCallersIds = (current?.assignedCallers || []).map((id: any) => String(id))

    const unionIds = new Set<string>([
      ...assignedCallersIds,
      ...Object.keys(incomingGoals || {}),
      ...Object.keys(incomingRates || {}),
      ...incomingAssignments.map(a => String(a?.id)).filter(Boolean),
    ])

    const lookupNames = async (ids: string[]) => {
      const userDocs = await gcAgent.find({ _id: { $in: ids.map(id => new Types.ObjectId(id)) } }).select('name firstName lastName').lean()
      const map = new Map<string, string>()
      for (const u of userDocs as any[]) {
        const nm = (u as any).name || [ (u as any).firstName, (u as any).lastName ].filter(Boolean).join(' ')
        map.set(String((u as any)._id), nm)
      }
      return map
    }
    const idsArray = Array.from(unionIds)
    const nameById = await lookupNames(idsArray)

    const normalizedAssignments = idsArray.map(id => {
      const fromArray = incomingAssignments.find(a => String(a?.id) === id) || {}
      const name = fromArray.name || nameById.get(id) || ''
      const goal = Number(fromArray.goal ?? (incomingGoals?.[id])) || 0
      const rate = Number(fromArray.rate ?? (incomingRates?.[id])) || 0
      return { id, name, goal, rate }
    })
    updatedData.agentAssignments = normalizedAssignments
    updatedData.agentGoals = Object.fromEntries(normalizedAssignments.map((a: any) => [a.id, a.goal]))
    updatedData.agentRates = Object.fromEntries(normalizedAssignments.map((a: any) => [a.id, a.rate]))

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updatedData, { new: true })
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.status(200).json({ message: 'Order updated successfully', order: updatedOrder })
  } catch (err: any) {
    console.error('Error updating order:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Delete an order
export const deleteOrder = async (req: Request, res: Response) => {
  const orderId = req.params.id
  console.log('Deleting order with ID:', orderId)
  try {
    await Order.findByIdAndDelete(orderId)
    res.status(200).json({ message: 'Order deleted successfully' })
  } catch (err: any) {
    console.error('Error deleting order:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function computeAgentOrderRevenuesGrouped(
  fromDate: Date,
  toDate: Date,
  onlyAgentId?: string
): Promise<{
  agents: Array<AgentBucket & { totals: { revenue: number; orders: number } }>;
}> {
  const orders = await Order.find({
    startDate: { $lte: toDate },
    deadline:  { $gte: fromDate },
  })
    .select('caseId caseName pricePerUnit startDate deadline assignedCallers agentGoals')
    .lean();

  // collect agent ids
  const agentIdsUsed = new Set<string>();
  for (const order of orders) {
    for (const assignedId of (order.assignedCallers ?? [])) {
      agentIdsUsed.add(String(assignedId));
    }
  }

  // fetch names
  const userDocs = await gcAgent.find({
    _id: { $in: Array.from(agentIdsUsed).map(id => new Types.ObjectId(id)) },
  }).select('name firstName lastName').lean();

  const displayNameById = new Map<string, string>(
    userDocs.map(u => {
      const displayName =
        (u as any).name ||
        [ (u as any).firstName, (u as any).lastName ].filter(Boolean).join(' ') ||
        '(unknown)';
      return [ String(u._id), displayName ];
    })
  );

  // group
  const buckets: Record<string, AgentBucket> = {};
  for (const order of orders) {
    const pricePerUnit = Number(order.pricePerUnit) || 0;
    const goalsByAgent = (order.agentGoals ?? {}) as Record<string, unknown>;
    const assignedAgentIds = (order.assignedCallers ?? []) as Types.ObjectId[];

    for (const assignedId of assignedAgentIds) {
      const agentId = String(assignedId);
      if (onlyAgentId && agentId !== onlyAgentId) continue;

      const goalForThisOrder = Number(goalsByAgent[agentId]) || 0;
      const revenueForThisOrder = goalForThisOrder * pricePerUnit;
      const agentName = displayNameById.get(agentId) ?? '(unknown)';

      if (!buckets[agentId]) {
        buckets[agentId] = {
          agentId,
          agentName,
          totalRevenue: 0,
          orders: [],
        };
      }

      buckets[agentId].orders.push({
        orderId: String(order._id),
        caseId: String(order.caseId),
        caseName: order.caseName,
        goal: goalForThisOrder,
        pricePerUnit,
        revenue: revenueForThisOrder,
        startDate: order.startDate,
        deadline: order.deadline,
      });

      buckets[agentId].totalRevenue += revenueForThisOrder;
    }
  }

  // shape: attach totals to each agent and sort
  const agents = Object.values(buckets)
    .map(a => ({
      ...a,
      totals: { revenue: a.totalRevenue, orders: a.orders.length },
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return { agents };
}


export const listAgentOrderRevenues = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    if (!from || !to) return res.status(400).json({ error: 'from and to are required (ISO dates)' });

    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (isNaN(+fromDate) || isNaN(+toDate)) return res.status(400).json({ error: 'Invalid date(s)' });

    const onlyAgentId =
      (req as any)?.gcAgent?.role === 'caller' ? String((req as any).gcAgent._id) : undefined;

    const { agents } = await computeAgentOrderRevenuesGrouped(fromDate, toDate, onlyAgentId);
    res.status(200).json({ agents });
  } catch (err: any) {
    console.error('Error listing agent order revenues:', err?.message || err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
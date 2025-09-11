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
      res.json(order)
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

    const newOrder = new Order({
      caseId: req.body.caseId,
      caseName: req.body.caseName,
      caseUnit: req.body.caseUnit,
      pricePerUnit: req.body.pricePerUnit,
      totalQuantity: req.body.totalQuantity,
      startDate: req.body.startDate || new Date(), // Default to current date if not provided
      deadline: req.body.deadline,
      orderStatus: req.body.orderStatus || 'pending',
      estimatedRevenue: req.body.estimatedRevenue,
      assignedCallers: assignedCallers,
      agentGoals: req.body.agentGoals || {} 

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
  const updatedData = req.body

  try {
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
import { Request, Response } from 'express'
import mongoose, { Types } from 'mongoose';
import gcAgentModel from '../models/gcAgent'
import User from '../models/user'

// Create a new agent
export const createAgent = async (req: Request, res: Response) => {
  try {

    // Explicitly coerce/cast the id (if provided)
    const rawId = req.body?.linkedUserId;
    const castLinked =
      rawId && Types.ObjectId.isValid(rawId) ? new Types.ObjectId(rawId) : null;

    const agent = await gcAgentModel.create({
      name:  req.body.name,
      email: req.body.email,
      role:  req.body.role,
      active:req.body.active ?? true,
      linkedUserId: castLinked,            // <-- assign explicitly
    })

    if (castLinked) {
      await User.findByIdAndUpdate(castLinked, {
        $set: { role: agent.role, linkedUserId: agent._id },
      })
      console.log('[gcAgents POST] Synced User (role + linkedUserId → gcAgent):', String(castLinked))
    }

    res.status(201).json(agent);
  } catch (err) {
    console.error('CREATE ERROR:', err);
    res.status(400).json({ message: 'Failed to create agent', error: err });
  }
};

// Get all agents
export const getAllAgents = async (_req: Request, res: Response) => {
  try {
    const agents = await gcAgentModel.find().sort({ createdAt: -1 })
    res.json(agents)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch agents', error: err })
  }
}

// Get agent by ID
export const getAgentById = async (req: Request, res: Response) => {
  try {
    const agent = await gcAgentModel.findById(req.params.id)
    if (!agent) return res.status(404).json({ message: 'Agent not found' })
    res.json(agent)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch agent', error: err })
  }
}

// Update agent
export const updateAgent = async (req: Request, res: Response) => {
  try {
    console.log('[gcAgents PUT] Keys received:', Object.keys(req.body || {}))
    console.log('[gcAgents PUT] Incoming from frontend:', {
      agentId: req.params.id,
      name: req.body?.name,
      email: req.body?.email,
      role: req.body?.role,
      active: req.body?.active,
      linkedUserId: req.body?.linkedUserId,
    })
    console.log('[gcAgents PUT] Raw body:', req.body)
    console.log('[gcAgents PUT] ID sanity:', {
      routeAgentId: req.params.id,
      bodyId: (req.body as any)?._id,
      bodyLinkedUserId: (req.body as any)?.linkedUserId,
    })

    // Normalize linkedUserId exactly like in createAgent
    const rawId = (req.body as any)?.linkedUserId
    const castLinked =
      rawId && Types.ObjectId.isValid(rawId) ? new Types.ObjectId(rawId) : null
    console.log('[gcAgents PUT] linkedUserId normalize:', {
      rawId,
      rawType: typeof rawId,
      isValidObjectId: !!(rawId && Types.ObjectId.isValid(rawId)),
      castLinked: castLinked ? String(castLinked) : null,
    })

    // Build a partial update payload; only write fields explicitly provided
    const payload: any = {}
    if (req.body.name !== undefined) payload.name = req.body.name
    if (req.body.email !== undefined) payload.email = req.body.email
    if (req.body.role !== undefined) payload.role = req.body.role
    if (req.body.active !== undefined) payload.active = req.body.active

    // Only include linkedUserId if it was provided explicitly in the body
    if (rawId !== undefined) {
      payload.linkedUserId = castLinked
    }
    console.log('[gcAgents PUT] Final update payload:', payload)

    const existing = await gcAgentModel.findById(req.params.id).select('linkedUserId').lean()
    const oldLinked = existing?.linkedUserId ? String(existing.linkedUserId) : null

    const updated = await gcAgentModel.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    )
    if (!updated) return res.status(404).json({ message: 'Agent not found' })

    const newLinked = updated.linkedUserId ? String(updated.linkedUserId) : null

    // Unlink or switch link: clear linkedUserId (gcAgent ref) on previous Google user
    if (oldLinked && oldLinked !== newLinked) {
      await User.findByIdAndUpdate(oldLinked, { $unset: { linkedUserId: 1 } })
      console.log('[gcAgents PUT] Cleared linkedUserId on previous user:', oldLinked)
    }

    // Linked Google user: only role + linkedUserId (gcAgent _id); never name/email/avatar
    if (newLinked) {
      const sync = await User.findByIdAndUpdate(
        newLinked,
        {
          $set: {
            role: updated.role,
            linkedUserId: updated._id,
          },
        },
        { new: true }
      )
      if (sync) {
        console.log('[gcAgents PUT] Synced User:', {
          userId: String(sync._id),
          role: sync.role,
          linkedUserId: String(sync.linkedUserId ?? ''),
        })
      } else {
        console.warn('[gcAgents PUT] linkedUserId set but no User found:', newLinked)
      }
    }

    console.log('[gcAgents PUT] Updated gcAgent in DB:', {
      _id: String(updated._id),
      name: updated.name,
      email: updated.email,
      role: updated.role,
      active: updated.active,
      linkedUserId: updated.linkedUserId ? String(updated.linkedUserId) : null,
    })
    res.json(updated)
  } catch (err: any) {
    console.error('[gcAgents PUT] update failed:', err?.message, err)
    res.status(400).json({ message: 'Failed to update agent', error: err?.message ?? err })
  }
}

// Delete agent
export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const deleted = await gcAgentModel.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ message: 'Agent not found' })
    res.json({ message: 'Agent deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete agent', error: err })
  }
}

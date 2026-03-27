import { Request, Response } from 'express'
import AgentWeeklyNote from '../models/agentWeeklyNote'

export const getAgentWeeklyNotes = async (req: Request, res: Response) => {
  try {
    const { agentId, monthKey } = req.query as { agentId?: string; monthKey?: string }
    if (!agentId || !monthKey) {
      return res.status(400).json({ message: 'agentId and monthKey are required' })
    }

    const docs = await AgentWeeklyNote.find({ agentId, monthKey }).sort({ weekStart: 1 }).lean()
    return res.status(200).json(docs)
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Failed to fetch notes' })
  }
}

// Supports:
// - PUT /agentWeeklyNotes/:agentId/:weekKey
// - PUT /agentWeeklyNotes/:agentId/:monthKey/:weekKey
// - POST /agent-weekly-notes with agentId, weekKey, weekStart, weekEnd, monthKey, note in body
export const upsertAgentWeeklyNote = async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      agentId?: string
      monthKey?: string
      weekKey?: string
      weekStart?: string
      weekEnd?: string
      note?: string
    }

    const agentId = (req.params.agentId || body.agentId || '').toString()
    const weekKey = (req.params.weekKey || body.weekKey || '').toString()
    const monthKey = (req.params.monthKey || body.monthKey || '').toString()
    const { weekStart, weekEnd, note } = body

    if (!agentId || !weekKey) {
      return res.status(400).json({ message: 'agentId and weekKey are required' })
    }
    if (!weekStart || !weekEnd || !monthKey) {
      return res.status(400).json({ message: 'weekStart, weekEnd and monthKey are required' })
    }

    const ws = new Date(weekStart)
    const we = new Date(weekEnd)
    if (Number.isNaN(ws.getTime()) || Number.isNaN(we.getTime())) {
      return res.status(400).json({ message: 'Invalid weekStart/weekEnd date' })
    }

    const user = (req as any).user || {}
    const actorId = String(user?.id || user?._id || '')

    const existing = await AgentWeeklyNote.findOne({ agentId, weekKey }).lean()
    const update: any = {
      agentId,
      weekKey,
      weekStart: ws,
      weekEnd: we,
      monthKey: String(monthKey),
      note: String(note ?? ''),
      updatedBy: actorId || undefined,
    }
    if (!existing) update.createdBy = actorId || undefined

    const doc = await AgentWeeklyNote.findOneAndUpdate(
      { agentId, weekKey },
      update,
      { upsert: true, new: true, runValidators: true }
    )
    return res.status(200).json(doc)
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Failed to upsert note' })
  }
}

export const deleteAgentWeeklyNote = async (req: Request, res: Response) => {
  try {
    const { agentId, weekKey } = req.params
    const doc = await AgentWeeklyNote.findOneAndDelete({ agentId, weekKey })
    if (!doc) return res.status(404).json({ message: 'Note not found' })
    return res.sendStatus(204)
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Failed to delete note' })
  }
}


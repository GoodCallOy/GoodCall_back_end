import { Request, Response } from 'express'
import DailyLog from '../models/dailyLog'

// Get all daily logs
export const getAllDailyLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await DailyLog.find().populate('agentId').populate('orderId')
    res.status(200).json(logs)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs', error: err })
  }
}

// Get daily logs by agent ID
export const getLogsByAgentId = async (req: Request, res: Response) => {
  try {
    const logs = await DailyLog.find({ agentId: req.params.agentId }).populate('orderId')
    res.status(200).json(logs)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch agent logs', error: err })
  }
}

// Add a new daily log
export const addDailyLog = async (req: Request, res: Response) => {
  try {
    const { agentId, agentName, orderId, caseName, goalType, call_time, completed_calls, outgoing_calls, answered_calls, response_rate, date, quantityCompleted,  } = req.body
    console.log('dailylog data:', req.body)
    const newLog = new DailyLog({
      agentId,
      agentName,
      orderId,
      caseName,
      goalType,
      call_time: call_time || 0,
      completed_calls: completed_calls || 0,
      outgoing_calls: outgoing_calls || 0,
      answered_calls: answered_calls || 0,
      response_rate: response_rate || 0,
      date: date || new Date(),
      quantityCompleted: quantityCompleted || 0
    })
    
    const savedLog = await newLog.save()
    console.log('Adding new daily log:', newLog)
    res.status(201).json({ message: 'Daily log saved', log: savedLog })
  } catch (err) {
    console.error('Error saving daily log:', err);
    res.status(400).json({ message: 'Failed to add log', error: err })
  }
}

// Update an existing daily log
export const updateDailyLog = async (req: Request, res: Response) => {
  try {
    const updatedLog = await DailyLog.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updatedLog) {
      return res.status(404).json({ message: 'Log not found' })
    }
    res.status(200).json({ message: 'Log updated', log: updatedLog })
  } catch (err) {
    res.status(400).json({ message: 'Failed to update log', error: err })
  }
}

// Delete a daily log
export const deleteDailyLog = async (req: Request, res: Response) => {
  try {
    await DailyLog.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Log deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete log', error: err })
  }
}

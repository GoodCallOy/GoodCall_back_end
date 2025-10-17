import { Request, Response } from 'express'
import DailyLog from '../models/dailyLog'

// Get all daily logs
export const getAllDailyLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await DailyLog.find().populate('agent').populate('order')
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

// Example for MongoDB/Mongoose
export const getLogsByCase = async (req: Request, res: Response) => {
  const { caseName } = req.params;
  const { year, month } = req.query;

  const yearNum = typeof year === 'string' ? parseInt(year, 10) : undefined;
  const monthNum = typeof month === 'string' ? parseInt(month, 10) : undefined;

  // Build date range for the month
  let dateFilter = {};
  if (typeof yearNum === 'number' && !isNaN(yearNum) && typeof monthNum === 'number' && !isNaN(monthNum)) {
    const start = new Date(yearNum, monthNum - 1, 1); // JS months are 0-based
    const end = new Date(yearNum, monthNum, 1);
    dateFilter = { date: { $gte: start, $lt: end } };
  }

  try {
    const logs = await DailyLog.find({
      caseName,
      ...dateFilter,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to find log', error: err });
  }
};

// Add a new daily log
export const addDailyLog = async (req: Request, res: Response) => {
  try {
    const { agent, agentName, order, caseName, caseUnit, call_time, completed_calls, outgoing_calls, answered_calls, response_rate, date, quantityCompleted,  } = req.body
    console.log('dailylog data:', req.body)
    const counters = {
      outboundCalls: Number(req.body.outboundCalls) || 0,
      completedCalls: Number(req.body.completedCalls) || 0,
      aLeads: Number(req.body.aLeads) || 0,
      bLeads: Number(req.body.bLeads) || 0,
      cLeads: Number(req.body.cLeads) || 0,
      dLeads: Number(req.body.dLeads) || 0,
      noPotential: Number(req.body.noPotential) || 0,
      interviews: Number(req.body.interviews) || 0,
      hours: Number(req.body.hours) || 0,
      bookedInterviews: Number(req.body.bookedInterviews) || 0,
      completedInterviews: Number(req.body.completedInterviews) || 0,
    }
    const newLog = new DailyLog({
      agent,
      agentName,
      order,
      caseName,
      caseUnit,
      call_time: call_time || 0,
      completed_calls: completed_calls || 0,
      outgoing_calls: outgoing_calls || 0,
      answered_calls: answered_calls || 0,
      response_rate: response_rate || 0,
      date: date || new Date(),
      quantityCompleted: quantityCompleted || 0,
      ...counters,
      resultAnalysis: String(req.body.resultAnalysis ?? ''),
      comments: String(req.body.comments ?? ''),
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

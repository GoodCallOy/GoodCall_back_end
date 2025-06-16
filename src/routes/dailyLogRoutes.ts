import express from 'express'
import {
  getAllDailyLogs,
  getLogsByAgentId,
  addDailyLog,
  updateDailyLog,
  deleteDailyLog
} from '../controllers/dailyLogController'

const router = express.Router()

// GET /api/daily-logs - Get all logs
router.get('/', getAllDailyLogs)

// GET /api/daily-logs/agent/:agentId - Get logs by agent ID
router.get('/agent/:agentId', getLogsByAgentId)

// POST /api/daily-logs - Create a new log
router.post('/', addDailyLog)

// PUT /api/daily-logs/:id - Update a log
router.put('/:id', updateDailyLog)

// DELETE /api/daily-logs/:id - Delete a log
router.delete('/:id', deleteDailyLog)

export default router

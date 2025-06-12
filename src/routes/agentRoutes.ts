import express from 'express'
import {
  getAllAgents,
  getAgentById,
  addAgent,
  modifyAgent,
  deleteAgent
} from '../controllers/agentController'

const router = express.Router()

router.get('/', getAllAgents)
router.get('/:id', getAgentById)
router.post('/', addAgent)
router.put('/:id', modifyAgent)
router.delete('/:id', deleteAgent)

export default router

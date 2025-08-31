import express from 'express'
import {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent
} from '../controllers/gcAgentController'

const router = express.Router()

// POST /api/agents - Create a new agent
router.post('/', createAgent)

// GET /api/agents - Get all agents
router.get('/', getAllAgents)

// GET /api/agents/:id - Get one agent by ID
router.get('/:id', getAgentById)

// PUT /api/agents/:id - Update an agent
router.put('/:id', updateAgent)

// DELETE /api/agents/:id - Delete an agent
router.delete('/:id', deleteAgent)

export default router

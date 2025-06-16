import { Request, Response } from 'express'
import gcAgentModel from '../models/gcAgent'

// Create a new agent
export const createAgent = async (req: Request, res: Response) => {
  try {
    const agent = new gcAgentModel(req.body)
    await agent.save()
    res.status(201).json(agent)
  } catch (err) {
    res.status(400).json({ message: 'Failed to create agent', error: err })
  }
}

// Get all agents
export const getAllAgents = async (_req: Request, res: Response) => {
  try {
    const agents = await gcAgentModel.find().sort({ createdAt: -1 })
    console.log('Fetched gcAgents:', agents)
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
    const updated = await gcAgentModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ message: 'Agent not found' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ message: 'Failed to update agent', error: err })
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

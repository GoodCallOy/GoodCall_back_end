import { Request, Response } from 'express'
import User from '../models/gcAgent'

// Get all agents
export const getAllAgents = async (req: Request, res: Response) => {
  try {
    const agents = await User.find()
    res.status(200).json(agents)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

// Get agent by ID
export const getAgentById = async (req: Request, res: Response) => {
  try {
    const agent = await User.findById(req.params.id)
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' })
    }
    res.status(200).json(agent)
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Add a new agent
export const addAgent = async (req: Request, res: Response) => {
  try {
    const newAgent = new User({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      active: req.body.active ?? true
    })

    await newAgent.save()
    res.status(200).json({ message: 'Agent added successfully', agent: newAgent })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

// Modify an existing agent
export const modifyAgent = async (req: Request, res: Response) => {
  try {
    const updatedAgent = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updatedAgent) {
      return res.status(404).json({ error: 'Agent not found' })
    }
    res.status(200).json({ message: 'Agent updated', agent: updatedAgent })
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Delete an agent
export const deleteAgent = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Agent deleted successfully' })
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

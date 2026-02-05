import { Request, Response } from 'express'
import Case from '../models/case'
import Order from '../models/orders'
import DailyLog from '../models/dailyLog'
import AgentGoals from '../models/agentGoals'

// Get all clients
export const getAllCases = async (req: Request, res: Response) => {
  try {
    const cases = await Case.find()
    res.status(200).json(cases)
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

// Get case by ID
export const getCaseById = async (req: Request, res: Response) => {
  try {
    const cases = await Case.findById(req.params.id)
    if (!cases) {
      return res.status(404).json({ error: 'Case not found' })
    }
    res.status(200).json(cases)
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Add a new case
export const addCase = async (req: Request, res: Response) => {
  try {
    const newCase = new Case({
      name: req.body.name,
      contactInfo: req.body.contactInfo
    })

    await newCase.save()
    res.status(200).json({ message: 'GC Case added successfully', case: newCase })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

// Modify an existing case
export const modifyCase = async (req: Request, res: Response) => {
  try {
    const caseId = req.params.id

    // Load existing to compare name
    const existing = await Case.findById(caseId)
    if (!existing) {
      return res.status(404).json({ error: 'Case not found' })
    }

    const updatedCase = await Case.findByIdAndUpdate(caseId, req.body, { new: true })
    if (!updatedCase) {
      return res.status(404).json({ error: 'Case not found after update' })
    }

    const oldName = existing.name
    const newName = (req.body && typeof req.body.name === 'string')
      ? req.body.name
      : updatedCase.name

    if (newName && newName !== oldName) {
      try {
        // 1) Orders: update denormalized caseName
        await Order.updateMany(
          { caseName: oldName },
          { $set: { caseName: newName } }
        )

        // 2) Daily logs: update by caseName string
        await DailyLog.updateMany(
          { caseName: oldName },
          { $set: { caseName: newName } }
        )

        // 3) Weekly goals: update caseName field
        await AgentGoals.updateMany(
          { caseName: oldName },
          { $set: { caseName: newName } }
        )

        console.log(
          `Cascade gcCase name change "${oldName}" -> "${newName}" on orders, daily logs, weekly goals`
        )
      } catch (cascadeErr) {
        console.error('Error during gcCase name cascade update:', cascadeErr)
        // Do not fail main request due to cascade issues
      }
    }

    res.status(200).json({ message: 'Case updated', case: updatedCase })
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Delete a case
export const deleteCase = async (req: Request, res: Response) => {
  try {
    await Case.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Case deleted successfully' })
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

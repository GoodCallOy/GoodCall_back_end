import { Request, Response } from 'express'
import Case from '../models/case'

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
    res.status(200).json({ message: '1. Case added successfully', case: newCase })
  } catch (err: any) {
    res.status(400).json({ message: err.message })
  }
}

// Modify an existing case
export const modifyCase = async (req: Request, res: Response) => {
  try {
    const updatedCase = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updatedCase) {
      return res.status(404).json({ error: 'Case not found' })
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

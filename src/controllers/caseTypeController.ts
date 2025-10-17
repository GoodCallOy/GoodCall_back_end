import { Request, Response } from 'express'
import CaseType from '../models/caseType'

export async function listCaseTypes(req: Request, res: Response) {
  const docs = await CaseType.find({ isActive: true })
    .sort({ sortOrder: 1, labelLower: 1 })
    .lean()
  const labels = docs.map(d => d.label)
  console.log('GET /api/v1/case-types ->', labels)
  return res.status(200).json(labels)
}

export async function createCaseType(req: Request, res: Response) {
  const label = String(req.body?.label ?? '').trim()
  if (!label || label.length > 64) {
    return res.status(400).json({ message: 'Invalid label' })
  }
  const existing = await CaseType.findOne({ labelLower: label.toLowerCase() })
  if (existing) return res.status(409).json({ message: 'Label already exists' })
  const doc = await CaseType.create({ label })
  return res.status(201).json(doc.label)
}

export async function updateCaseType(req: Request, res: Response) {
  const id = req.params.id
  const label = String(req.body?.label ?? '').trim()
  if (!label || label.length > 64) {
    return res.status(400).json({ message: 'Invalid label' })
  }
  const exists = await CaseType.findOne({ labelLower: label.toLowerCase(), _id: { $ne: id } })
  if (exists) return res.status(409).json({ message: 'Label already exists' })
  const doc = await CaseType.findByIdAndUpdate(id, { label }, { new: true })
  if (!doc) return res.status(404).json({ message: 'Not found' })
  return res.status(200).json(doc.label)
}

export async function deleteCaseType(req: Request, res: Response) {
  const id = req.params.id
  const doc = await CaseType.findByIdAndDelete(id)
  if (!doc) return res.status(404).json({ message: 'Not found' })
  return res.sendStatus(204)
}



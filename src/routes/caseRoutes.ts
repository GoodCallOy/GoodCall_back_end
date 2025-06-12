import express from 'express'
import {
  getAllCases,
  getCaseById,
  addCase,
  modifyCase,
  deleteCase
} from '../controllers/caseController'

const router = express.Router()

router.get('/', getAllCases)
router.get('/:id', getCaseById)
router.post('/', addCase)
router.put('/:id', modifyCase)
router.delete('/:id', deleteCase)

export default router

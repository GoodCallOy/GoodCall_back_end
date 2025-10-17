import { Router } from 'express'
import { listCaseTypes, createCaseType, updateCaseType, deleteCaseType } from '../controllers/caseTypeController'
import { requireAuth, requireRole } from '../middleware/authz'

const router = Router()

router.get('/case-types', requireAuth, listCaseTypes)
router.post('/case-types', requireAuth, requireRole('admin', 'manager'), createCaseType)
router.put('/case-types/:id', requireAuth, requireRole('admin', 'manager'), updateCaseType)
router.delete('/case-types/:id', requireAuth, requireRole('admin', 'manager'), deleteCaseType)

export default router



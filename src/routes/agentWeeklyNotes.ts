import { Router } from 'express'
import { getAgentWeeklyNotes, upsertAgentWeeklyNote, deleteAgentWeeklyNote } from '../controllers/agentWeeklyNotes'
import { requireAuth, requireRole } from '../middleware/authz'

const router = Router()

// Read notes
router.get('/', requireAuth, getAgentWeeklyNotes)

// Write (upsert) notes
// Matches frontend primary endpoint: PUT /agentWeeklyNotes/:agentId/:monthKey/:weekKey
router.put('/:agentId/:monthKey/:weekKey', requireAuth, requireRole('admin', 'manager'), upsertAgentWeeklyNote)
// Also support simpler form: PUT /agentWeeklyNotes/:agentId/:weekKey
router.put('/:agentId/:weekKey', requireAuth, requireRole('admin', 'manager'), upsertAgentWeeklyNote)
// Fallback POST /agent-weekly-notes with data in body
router.post('/', requireAuth, requireRole('admin', 'manager'), upsertAgentWeeklyNote)

// Optional delete
router.delete('/:agentId/:weekKey', requireAuth, requireRole('admin', 'manager'), deleteAgentWeeklyNote)

export default router


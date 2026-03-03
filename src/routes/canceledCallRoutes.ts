import { Router } from 'express';
import { createCanceledCall, listCanceledCalls, updateCanceledCall, getCanceledMeetingsSummary } from '../controllers/canceledCallController';

const router = Router();

router.get('/', listCanceledCalls);
router.get('/summary', getCanceledMeetingsSummary);
router.post('/', createCanceledCall);
router.patch('/:id', updateCanceledCall);

export default router;

import { Router } from 'express';
import { createCanceledCall, listCanceledCalls, updateCanceledCall } from '../controllers/canceledCallController';

const router = Router();

router.get('/', listCanceledCalls);
router.post('/', createCanceledCall);
router.patch('/:id', updateCanceledCall);

export default router;

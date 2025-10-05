import express from 'express';
import {
  getWeekConfigBase,
  getWeekConfigByYearMonth,
  createOrUpdateWeekConfig,
  deleteWeekConfig,
  getWeekConfigsByYear
} from '../controllers/weekConfigController';

const router = express.Router();

// GET /api/v1/week-config - supports ?year=YYYY&month=MM or falls back to current
router.get('/', getWeekConfigBase);

// GET /api/v1/week-config/:year/:month - Get week configuration for a specific month
router.get('/:year/:month', getWeekConfigByYearMonth);

// GET /api/v1/week-config/year/:year - Get all configurations for a year
router.get('/year/:year', getWeekConfigsByYear);

// POST /api/v1/week-config - Create or update week configuration
router.post('/', createOrUpdateWeekConfig);

// DELETE /api/v1/week-config/:year/:month - Delete week configuration
router.delete('/:year/:month', deleteWeekConfig);

export default router;

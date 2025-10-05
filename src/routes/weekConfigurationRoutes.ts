import express from 'express';
import {
  getAllWeekConfigurations,
  getWeekConfigurationById,
  getWeekConfigurationByYearMonth,
  getDefaultWeekConfiguration,
  createWeekConfiguration,
  updateWeekConfiguration,
  deleteWeekConfiguration,
  toggleWeekStatus,
  getWeeksInDateRange
} from '../controllers/weekConfigurationController';

const router = express.Router();

// GET /api/v1/week-configurations - Get all week configurations with optional filters
router.get('/', getAllWeekConfigurations);

// GET /api/v1/week-configurations/default - Get default week configuration
router.get('/default', getDefaultWeekConfiguration);

// GET /api/v1/week-configurations/date-range - Get weeks in a specific date range
router.get('/date-range', getWeeksInDateRange);

// GET /api/v1/week-configurations/year/:year/month/:month - Get configuration by year and month
router.get('/year/:year/month/:month', getWeekConfigurationByYearMonth);

// GET /api/v1/week-configurations/:id - Get week configuration by ID
router.get('/:id', getWeekConfigurationById);

// POST /api/v1/week-configurations - Create new week configuration
router.post('/', createWeekConfiguration);

// PUT /api/v1/week-configurations/:id - Update week configuration
router.put('/:id', updateWeekConfiguration);

// PATCH /api/v1/week-configurations/:id/weeks/:weekNumber/toggle - Toggle week active status
router.patch('/:id/weeks/:weekNumber/toggle', toggleWeekStatus);

// DELETE /api/v1/week-configurations/:id - Delete week configuration
router.delete('/:id', deleteWeekConfiguration);

export default router;

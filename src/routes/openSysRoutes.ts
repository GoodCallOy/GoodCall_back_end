import express from 'express';
import {
  getAllOpenSys,
  getOpenSysById,
  importData,
  createOpenSys,
  updateOpenSys,
  deleteOpenSys,
  deleteAllOpenSys,
} from '../controllers/openSysController';

const router = express.Router();

// GET /api/v1/openSys - Get all records
router.get('/', getAllOpenSys);

// GET /api/v1/openSys/:id - Get a single record by ID
router.get('/:id', getOpenSysById);

// POST /api/v1/openSys/import - Import data from frontend (batch import)
router.post('/import', importData);

// POST /api/v1/openSys - Create a new record
router.post('/', createOpenSys);

// PUT /api/v1/openSys/:id - Update a record
router.put('/:id', updateOpenSys);

// DELETE /api/v1/openSys/:id - Delete a record
router.delete('/:id', deleteOpenSys);

// DELETE /api/v1/openSys - Delete all records
router.delete('/', deleteAllOpenSys);

export default router;


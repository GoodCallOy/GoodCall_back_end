import { Request, Response } from 'express';
import CanceledCall from '../models/canceledCall';
import { ICanceledCallCreateBody } from '../types/ICanceledCall';

function validateBody(body: any): string | null {
  if (!body.callDate || typeof body.callDate !== 'string') return 'callDate is required (YYYY-MM-DD)';
  if (!body.cancelDate || typeof body.cancelDate !== 'string') return 'cancelDate is required (YYYY-MM-DD)';
  if (!body.agent || typeof body.agent !== 'string') return 'agent is required (agent ID)';
  const callDate = new Date(body.callDate);
  const cancelDate = new Date(body.cancelDate);
  if (Number.isNaN(callDate.getTime())) return 'callDate must be a valid date (YYYY-MM-DD)';
  if (Number.isNaN(cancelDate.getTime())) return 'cancelDate must be a valid date (YYYY-MM-DD)';
  return null;
}

/** POST /api/v1/canceledCalls - create a canceled meeting record */
export const createCanceledCall = async (req: Request, res: Response) => {
  try {
    const body = req.body as ICanceledCallCreateBody;
    const err = validateBody(body);
    if (err) {
      return res.status(400).json({ message: err });
    }

    const doc = await CanceledCall.create({
      callDate: new Date(body.callDate),
      cancelDate: new Date(body.cancelDate),
      agent: body.agent,
      phoneNumber: body.phoneNumber ?? '',
      contactPerson: body.contactPerson ?? '',
      case: body.case ?? '',
      caseUnit: body.caseUnit ?? '',
      rebookAgent: body.rebookAgent ?? null,
      rebookDate: body.rebookDate ?? null,
      attempts: typeof body.attempts === 'number' ? body.attempts : (body.attempts != null ? Number(body.attempts) : 0),
      comments: body.comments ?? '',
    });

    console.log('[Canceled meetings] Saved:', {
      callDate: doc.callDate.toISOString().slice(0, 10),
      cancelDate: doc.cancelDate.toISOString().slice(0, 10),
      agent: doc.agent,
      case: doc.case,
      attempts: doc.attempts,
    });

    return res.status(201).json(doc);
  } catch (err: any) {
    console.error('Error creating canceled meeting:', err.message);
    return res.status(400).json({ message: err.message || 'Failed to save canceled meeting' });
  }
};

/** PATCH /api/v1/canceledCalls/:id - update a canceled meeting by ID */
export const updateCanceledCall = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const body = req.body as ICanceledCallCreateBody;
    const err = validateBody(body);
    if (err) {
      return res.status(400).json({ message: err });
    }

    const update: Record<string, unknown> = {
      callDate: new Date(body.callDate),
      cancelDate: new Date(body.cancelDate),
      agent: body.agent,
      phoneNumber: body.phoneNumber ?? '',
      contactPerson: body.contactPerson ?? '',
      case: body.case ?? '',
      caseUnit: body.caseUnit ?? '',
      rebookAgent: body.rebookAgent ?? null,
      rebookDate: body.rebookDate ?? null,
      attempts: typeof body.attempts === 'number' ? body.attempts : (body.attempts != null ? Number(body.attempts) : 0),
      comments: body.comments ?? '',
    };

    const doc = await CanceledCall.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!doc) {
      return res.status(404).json({ message: 'Canceled meeting not found' });
    }

    console.log('[Canceled meetings] Updated:', { id: doc._id, callDate: doc.callDate.toISOString().slice(0, 10), agent: doc.agent });

    return res.status(200).json(doc);
  } catch (err: any) {
    console.error('Error updating canceled meeting:', err.message);
    return res.status(400).json({ message: err.message || 'Failed to update canceled meeting' });
  }
};

/** GET /api/v1/canceledCalls - list canceled meetings (optional query: agent, case, fromDate, toDate) */
export const listCanceledCalls = async (req: Request, res: Response) => {
  try {
    const { agent, case: caseId, fromDate, toDate } = req.query;
    const filter: Record<string, unknown> = {};
    if (typeof agent === 'string' && agent) filter.agent = agent;
    if (typeof caseId === 'string' && caseId) filter.case = caseId;
    if (typeof fromDate === 'string' && fromDate || typeof toDate === 'string' && toDate) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (typeof fromDate === 'string' && fromDate) dateFilter.$gte = new Date(fromDate);
      if (typeof toDate === 'string' && toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      filter.callDate = dateFilter;
    }
    const list = await CanceledCall.find(filter).sort({ callDate: -1 });
    return res.status(200).json(list);
  } catch (err: any) {
    console.error('Error listing canceled meetings:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

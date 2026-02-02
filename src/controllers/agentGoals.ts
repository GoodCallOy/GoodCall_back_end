import { Request, Response } from "express";
import AgentGoals from "../models/agentGoals";
import { IAgentGoals, IAgentGoalsCreateBody } from "../types/IAgentGoals";

/** Validate POST body and return error message or null */
function validateCreateBody(body: any): string | null {
  const { agentId, orderId, goal, type, goal_date, monthKey } = body;
  if (!agentId || typeof agentId !== 'string') return 'agentId is required';
  if (!orderId || typeof orderId !== 'string') return 'orderId is required';
  if (goal === undefined || goal === null) return 'goal is required';
  const num = Number(goal);
  if (Number.isNaN(num) || num < 0) return 'Goal must be 0 or greater';
  if (!type || type !== 'Weekly') return 'type must be "Weekly"';
  if (!goal_date || typeof goal_date !== 'object') return 'goal_date is required';
  const start = goal_date.start;
  const end = goal_date.end;
  if (!start || typeof start !== 'string') return 'goal_date.start is required (YYYY-MM-DD)';
  if (!end || typeof end !== 'string') return 'goal_date.end is required (YYYY-MM-DD)';
  // monthKey optional; backend derives from goal_date.start if not provided
  if (monthKey != null && typeof monthKey !== 'string') return 'monthKey must be a string (YYYY-MM) if provided';
  return null;
}

/** Create or update a weekly goal (upsert by agentId + orderId + week) */
export const addAgentGoals = async (req: Request, res: Response) => {
  try {
    const body = req.body as IAgentGoalsCreateBody;
    const err = validateCreateBody(body);
    if (err) {
      return res.status(400).json({ message: err });
    }

    const weekStart = new Date(body.goal_date.start);
    const weekEnd = new Date(body.goal_date.end);
    if (Number.isNaN(weekStart.getTime())) {
      return res.status(400).json({ message: 'goal_date.start must be a valid date (YYYY-MM-DD)' });
    }
    if (Number.isNaN(weekEnd.getTime())) {
      return res.status(400).json({ message: 'goal_date.end must be a valid date (YYYY-MM-DD)' });
    }
    // End date must be on or after start date (supports any week range, e.g. Wed–Tue)
    if (weekEnd < weekStart) {
      return res.status(400).json({ message: 'Week end date must be on or after week start date.' });
    }

    // monthKey from body (front end derives from start date) or derive from start if missing
    const monthKey =
      body.monthKey && typeof body.monthKey === 'string'
        ? body.monthKey
        : `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}`;

    const filter = {
      agentId: body.agentId,
      orderId: body.orderId,
      weekStartDate: weekStart,
    };

    const update = {
      agentId: body.agentId,
      orderId: body.orderId,
      agentName: body.agent ?? '',
      caseName: body.case ?? '',
      type: 'Weekly',
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      goal: Number(body.goal),
      monthKey,
    };

    const doc = await AgentGoals.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
      runValidators: true,
    });

    if (doc) {
      console.log('[Weekly goals] Saved:', {
        agent: doc.agentName,
        case: doc.caseName,
        week: `${doc.weekStartDate.toISOString().slice(0, 10)} – ${doc.weekEndDate.toISOString().slice(0, 10)}`,
        goal: doc.goal,
        monthKey: doc.monthKey,
      });
    }

    return res.status(doc ? 200 : 201).json(doc);
  } catch (err: any) {
    console.error('Error adding/updating agent goals:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: err.response?.data?.message || err.message || 'Failed to save goal' });
  }
};

/** List weekly goals; optional query: agentId, orderId, monthKey */
export const getAllAgentGoals = async (req: Request, res: Response) => {
  try {
    const { agentId, orderId, monthKey } = req.query;
    const filter: Record<string, unknown> = {};
    if (typeof agentId === 'string' && agentId) filter.agentId = agentId;
    if (typeof orderId === 'string' && orderId) filter.orderId = orderId;
    if (typeof monthKey === 'string' && monthKey) filter.monthKey = monthKey;

    const goals = await AgentGoals.find(filter).sort({ weekStartDate: 1 });
    return res.status(200).json(goals);
  } catch (err: any) {
    return res.status(400).json({ status: 400, message: err.message });
  }
};

export const getAgentGoalsById = async (req: Request, res: Response) => {
  const agentId = req.params.id;
  try {
    const goal: IAgentGoals | null = await AgentGoals.findById(agentId);
    if (!goal) {
      return res.status(404).json({ error: 'Agent goal not found' });
    }
    return res.status(200).json(goal);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** GET by agent name and month (legacy); prefer GET /?agentId=xxx&monthKey=YYYY-MM */
export const getAgentGoalsByAgentAndMonth = async (req: Request, res: Response) => {
  try {
    const agent = req.params.agent;
    const month = req.query.month as string | undefined;
    if (!agent) {
      return res.status(400).json({ error: 'Agent identifier required' });
    }
    const filter: Record<string, unknown> = {};
    // Support both agent name and agentId
    if (agent.length === 24 && /^[a-f0-9]+$/i.test(agent)) {
      filter.agentId = agent;
    } else {
      filter.agentName = agent;
    }
    if (month) filter.monthKey = month;
    const goals = await AgentGoals.find(filter).sort({ weekStartDate: 1 });
    return res.status(200).json(goals);
  } catch (error) {
    console.error('Error fetching agent goals:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const modifyAgentGoals = async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedData = req.body;
  try {
    const doc = await AgentGoals.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Agent goal not found' });
    return res.status(200).json({ message: 'Agent goal modified successfully.', modifiedAgent: doc });
  } catch (error) {
    console.error('Error modifying agent goals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAgentGoals = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const doc = await AgentGoals.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: 'Agent goal not found' });
    return res.status(200).json({ message: 'Agent goal deleted successfully.' });
  } catch (error) {
    console.error('Error deleting agent goals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

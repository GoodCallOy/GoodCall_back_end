import { Document } from "mongoose";

export interface IAgentGoals extends Document {
  agentId: string;
  orderId: string;
  agentName: string;
  caseName: string;
  type: string;
  weekStartDate: Date;
  weekEndDate: Date;
  goal: number;
  monthKey: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Request body for POST /api/v1/agentGoals/
 * Front end: user picks Month (current + next 3) then Week from week-config for that month.
 * goal_date.start/end are the chosen week's start and end (YYYY-MM-DD) from the config.
 */
export interface IAgentGoalsCreateBody {
  agent: string;
  agentId: string;
  case: string;
  orderId: string;
  goal: number;
  type: string;
  goal_date: {
    start: string; // YYYY-MM-DD — chosen week start (from week-config)
    end: string;  // YYYY-MM-DD — chosen week end (from week-config)
  };
  monthKey?: string; // YYYY-MM — optional; derived from goal_date.start if omitted
}

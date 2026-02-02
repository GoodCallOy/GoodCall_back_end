import mongoose, { Document, Model, Schema } from 'mongoose';
import { IAgentGoals } from '../types/IAgentGoals';

const agentGoalSchema = new Schema<IAgentGoals>(
  {
    agentId: { type: String, required: true },
    orderId: { type: String, required: true },
    agentName: { type: String, required: true },
    caseName: { type: String, required: true },
    type: { type: String, required: true, default: 'Weekly' },
    weekStartDate: { type: Date, required: true },
    weekEndDate: { type: Date, required: true },
    goal: { type: Number, required: true, min: 0 },
    monthKey: { type: String, required: true },
  },
  { timestamps: true, collection: 'weekly goals' }
);

// Unique constraint: one goal per agent + order + week (upsert key)
agentGoalSchema.index({ agentId: 1, orderId: 1, weekStartDate: 1 }, { unique: true });

const AgentGoals: Model<IAgentGoals> = mongoose.model<IAgentGoals>('AgentGoal', agentGoalSchema);

export default AgentGoals;

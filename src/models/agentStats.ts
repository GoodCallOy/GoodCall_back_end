import mongoose, { Document, Model, Schema  } from 'mongoose';
import IAgentStats from '../types/IAgentStats';

const agentStatsSchema: Schema<IAgentStats> = new Schema<IAgentStats>({
    name: {
    type: String,
    required: true,
  },
  meetings: {
    type: Number,
    required: false,
  },
  call_time: {
    type: Number,
    required: true,
  },
  calls_made: {
    type: Number,
    required: true,
  },
  outgoing_calls: {
    type: Number,
    required: true,
  },
  answered_calls: {
    type: Number,
    required: false,
  },
  response_rate: {
    type: Number,
    required: false,
  },
  case: {
    type: String,
    required: false,
  },
  calling_date: {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  create_date: {
    type: Date,
    default: Date.now,
  },
});

const AgentStats: Model<IAgentStats> = mongoose.model<IAgentStats>('AgentStats', agentStatsSchema);

export default AgentStats;
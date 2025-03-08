import mongoose, { Document, Model, Schema } from 'mongoose';
import IAgentGoals from '../types/IAgentGoals';

const agentGoalSchema = new Schema<IAgentGoals>({
    agent: { 
      type: String, 
      required: true 
    },
    case: { 
      type: String, 
      required: true 
    },
    goal: { 
      type: String,
       required: true 
    },
    goal_date: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    type: { 
      type: String,
      required: true 
    },
    create_date: { 
      type: Date, 
      default: Date.now 
    }
}, { timestamps: true }); // Auto-manages `createdAt` and `updatedAt`

const AgentGoals: Model<IAgentGoals> = mongoose.model<IAgentGoals>('AgentGoal', agentGoalSchema);

export default AgentGoals;

import mongoose, { Document, Model, Schema } from 'mongoose';
import IAgentCaseInfo from '../types/IAgentCaseInfo';

const agentGoalSchema = new Schema<IAgentCaseInfo>({
    agent: { 
      type: String, 
      required: true 
    },
    case: { 
      type: String, 
      required: true 
    },
    amount: { 
      type: String,
       required: true 
    },
    amount_date: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    type: { 
      type: String,
      required: true 
    },
    monthKey: {
      type: String, 
      required: true
    },
    create_date: { 
      type: Date, 
      default: Date.now 
    }
}, { timestamps: true }); // Auto-manages `createdAt` and `updatedAt`

const IAgentCaseInfo: Model<IAgentCaseInfo> = mongoose.model<IAgentCaseInfo>('IAgentCaseInfo', agentGoalSchema);

export default IAgentCaseInfo;

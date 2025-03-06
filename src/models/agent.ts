import mongoose, { Document, Model, Schema  } from 'mongoose';
import IAgent from '../types/IAgent';

const agentSchema: Schema<IAgent> = new Schema<IAgent>({
    name: {
    type: String,
    required: true,
  },
  cases: {
    type: [String],
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  create_date: {
    type: Date,
    default: () => Date.now(),
  },
});

const Agent: Model<IAgent> = mongoose.model<IAgent>('Agent', agentSchema);

export default Agent;
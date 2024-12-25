import mongoose, { Document, Model, Schema  } from 'mongoose';

export interface IAgent extends Document {
    name: string;
    cases: string[];
    position: string;
    create_date: Date;
}

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
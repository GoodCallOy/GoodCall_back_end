import mongoose, { Document, Model, Schema  } from 'mongoose';

export interface IAgent extends Document {
    name: string;
    meetings: number;
    call_time: number;
    calls_made: number;
    outgoing_calls: number;
    answered_calls: number;
    response_rate: number;
    case: string;
    create_date: Date;
}

const agentSchema: Schema<IAgent> = new Schema<IAgent>({
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
  create_date: {
    type: Date,
    default: Date.now,
  },
});

const Agent: Model<IAgent> = mongoose.model<IAgent>('Agent', agentSchema);

export default Agent;
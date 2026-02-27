import mongoose, { Document, Model, Schema } from 'mongoose';
import { ICanceledCall } from '../types/ICanceledCall';

const canceledCallSchema = new Schema<ICanceledCall>(
  {
    callDate: { type: Date, required: true },
    cancelDate: { type: Date, required: true },
    agent: { type: String, required: true },
    phoneNumber: { type: String, default: '' },
    contactPerson: { type: String, default: '' },
    case: { type: String, default: '' },
    caseUnit: { type: String, default: '' },
    rebookAgent: { type: String, default: null },
    rebookDate: { type: String, default: null },
    attempts: { type: Number, default: 0 },
    comments: { type: String, default: '' },
  },
  { timestamps: true, collection: 'canceled meetings' }
);

const CanceledCall: Model<ICanceledCall> = mongoose.model<ICanceledCall>('CanceledCall', canceledCallSchema);

export default CanceledCall;

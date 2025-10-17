import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IDailyLog extends Document {
  agent: Types.ObjectId
  agentName: string 
  order: Types.ObjectId
  caseName: string
  caseUnit: string
  call_time: number;
  completed_calls: number;
  outgoing_calls: number;
  answered_calls: number;
  response_rate: number;
  outboundCalls?: number
  completedCalls?: number
  aLeads?: number
  bLeads?: number
  cLeads?: number
  dLeads?: number
  noPotential?: number
  interviews?: number
  hours?: number
  bookedInterviews?: number
  completedInterviews?: number
  resultAnalysis?: string
  comments?: string
  date: Date
  quantityCompleted: number
}

const DailyLogSchema: Schema = new Schema<IDailyLog>(
  {
    agent: {
      type: Schema.Types.ObjectId,
      ref: 'gcAgent',
      required: true
    },
    agentName: {
      type: String,
      required: true
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    caseName: {
      type: String,
      required: true
    },
    caseUnit: {
      type: String,
      enum: ['hours', 'interviews', 'meetings'],
      required: true
    },
    call_time: {
      type: Number,
      required: true
    },
    completed_calls: {
      type: Number,
      required: true
    },
    outgoing_calls: {
      type: Number,
      required: true
    },
    answered_calls: {
      type: Number,
      required: true
    },
    response_rate: {
      type: Number,
      required: true
    },
    outboundCalls: { type: Number, default: 0 },
    completedCalls: { type: Number, default: 0 },
    aLeads: { type: Number, default: 0 },
    bLeads: { type: Number, default: 0 },
    cLeads: { type: Number, default: 0 },
    dLeads: { type: Number, default: 0 },
    noPotential: { type: Number, default: 0 },
    interviews: { type: Number, default: 0 },
    hours: { type: Number, default: 0 },
    bookedInterviews: { type: Number, default: 0 },
    completedInterviews: { type: Number, default: 0 },
    resultAnalysis: { type: String, default: '' },
    comments: { type: String, default: '' },
    date: {
      type: Date,
      required: true
    },
    quantityCompleted: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
)

export default mongoose.model<IDailyLog>('DailyLog', DailyLogSchema)

import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IDailyLog extends Document {
  agentId: Types.ObjectId
  agentName: string 
  orderId: Types.ObjectId
  orderName: string
  goalType: string
  call_time: number;
  completed_calls: number;
  outgoing_calls: number;
  answered_calls: number;
  response_rate: number;
  date: Date
  quantityCompleted: number
}

const DailyLogSchema: Schema = new Schema<IDailyLog>(
  {
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'gcAgent',
      required: true
    },
    agentName: {
      type: String,
      required: true
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    orderName: {
      type: String,
      required: true
    },
    goalType: {
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

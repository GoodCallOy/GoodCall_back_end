import mongoose, { Schema, Document, Types } from 'mongoose'

export type caseUnit = 'hours' | 'interviews' | 'meetings'
export type OrderStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold'

export interface IOrder extends Document {
  caseId: Types.ObjectId
  caseName: string 
  caseUnit: caseUnit
  pricePerUnit: number
  totalQuantity: number
  startDate: Date 
  deadline: Date
  orderStatus: OrderStatus
  estimatedRevenue: number
  assignedCallers: Types.ObjectId[]
  agentGoals: Record<string, number> 
  manager?: Types.ObjectId
  agentsPrice?: Record<string, number>
  createdAt: Date
  updatedAt: Date
}

const OrderSchema: Schema = new Schema<IOrder>(
  {
    caseId: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
      required: true
    },
    caseName: {
      type: String, // <- add this
      required: true
    },
    caseUnit: {
      type: String,
      enum: ['hours', 'interviews', 'meetings'],
      required: true
    },
    pricePerUnit: {
      type: Number,
      required: true 
    },
    totalQuantity: {
      type: Number,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    deadline: {
      type: Date,
      required: true
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled', 'on-hold'],
      required: true
    },
    estimatedRevenue: {
      type: Number,
      required: true
    },
    agentGoals: {
      type: Object, // or Map, or Mixed, depending on your needs
      default: {}
    },
    assignedCallers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'gcAgent',
      }
    ],
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    agentsPrice: {
      type: Map,
      of: Number,
      default: {}
    }
  },
  { timestamps: true }
)

export default mongoose.model<IOrder>('Order', OrderSchema)
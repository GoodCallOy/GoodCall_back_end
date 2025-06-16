import mongoose, { Schema, Document, Types } from 'mongoose'

export type GoalType = 'hours' | 'interviews' | 'meetings'
export type OrderStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold'

export interface IOrder extends Document {
  caseId: Types.ObjectId
  caseName: string 
  goalType: GoalType
  totalQuantity: number
  deadline: Date
  orderStatus: OrderStatus
  estimatedRevenue: number
  assignedCallers: Types.ObjectId[]
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
    goalType: {
      type: String,
      enum: ['hours', 'interviews', 'meetings'],
      required: true
    },
    totalQuantity: {
      type: Number,
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
    assignedCallers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'gcAgent',
      }
    ]
  },
  { timestamps: true }
)

export default mongoose.model<IOrder>('Order', OrderSchema)
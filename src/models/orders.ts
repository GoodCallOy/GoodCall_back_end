import mongoose, { Schema, Document, Types } from 'mongoose'

export type caseUnit = 'hours' | 'interviews' | 'meetings'
export type OrderStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold'
export type CaseType = string

export interface IOrder extends Document {
  caseId: Types.ObjectId
  caseName: string 
  caseUnit: caseUnit
  pricePerUnit: number
  totalQuantity: number
  campaignGoal?: number
  startDate: Date 
  deadline: Date
  orderStatus: OrderStatus
  caseType: CaseType
  ProjectManagmentFee?: number
  ProjectStartFee?: number
  estimatedRevenue: number
  assignedCallers: Types.ObjectId[]
  agentGoals: Record<string, number> 
  agentRates?: Record<string, number>
  agentAssignments?: Array<{
    id: string
    name?: string
    goal?: number
    rate?: number
  }>
  managers?: Types.ObjectId[]
  agentsPrice?: Record<string, number>
  searchedPhoneNumbers?: boolean
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
    campaignGoal: {
      type: Number,
      required: false,
      default: 0
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
    caseType: {
      type: String,
      required: true
    },
    ProjectManagmentFee: {
      type: Number,
      required: false,
      default: 0
    },
    ProjectStartFee: {
      type: Number,
      required: false,
      default: 0
    },
    estimatedRevenue: {
      type: Number,
      required: true
    },
    agentGoals: {
      type: Object, // or Map, or Mixed, depending on your needs
      default: {}
    },
    agentRates: {
      type: Map,
      of: Number,
      default: {}
    },
    agentAssignments: [
      {
        id: { type: String, required: true },
        name: { type: String, default: '' },
        goal: { type: Number, default: 0 },
        rate: { type: Number, default: 0 },
      }
    ],
    assignedCallers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'gcAgent',
      }
    ],
    managers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
    agentsPrice: {
      type: Map,
      of: Number,
      default: {}
    }
    ,
    searchedPhoneNumbers: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

export default mongoose.model<IOrder>('Order', OrderSchema)
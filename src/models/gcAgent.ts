import mongoose, { Schema, Document } from 'mongoose'

export type UserRole = 'admin' | 'caller' | 'manager'

export interface IgcAgent extends Document {
  name: string
  email: string
  role: UserRole
  linkedUserId?: mongoose.Types.ObjectId | null
  active: boolean
  createdAt: Date
}

const gcAgentSchema: Schema = new Schema<IgcAgent>(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    role: {
      type: String,
      enum: ['admin', 'caller', 'manager'],
      required: true
    },
    linkedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null 
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
)

export default mongoose.model<IgcAgent>('gcAgent', gcAgentSchema)
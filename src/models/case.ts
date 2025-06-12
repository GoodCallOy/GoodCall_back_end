import mongoose, { Schema, Document } from 'mongoose'

export interface IClient extends Document {
  name: string
  contactInfo?: {
    contactName?: string
    contactTitle?: string
    email?: string
  }
  createdAt: Date
}

const ClientSchema: Schema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: true
    },
    contactInfo: {
      contactName: {
        type: String
      },
      contactTitle: {
        type: String
      },
      email: {
        type: String
      },
    }
  },
  { timestamps: true }
)

export default mongoose.model<IClient>('gcCases', ClientSchema)
import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IAgentWeeklyNote extends Document {
  agentId: string
  weekKey: string
  weekStart: Date
  weekEnd: Date
  monthKey: string
  note: string
  createdBy?: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

const agentWeeklyNoteSchema = new Schema<IAgentWeeklyNote>(
  {
    agentId: { type: String, required: true, index: true },
    weekKey: { type: String, required: true, index: true },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    monthKey: { type: String, required: true, index: true },
    note: { type: String, default: '' },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true, collection: 'agent_weekly_notes' }
)

agentWeeklyNoteSchema.index({ agentId: 1, weekKey: 1 }, { unique: true })

const AgentWeeklyNote: Model<IAgentWeeklyNote> = mongoose.model<IAgentWeeklyNote>(
  'AgentWeeklyNote',
  agentWeeklyNoteSchema
)

export default AgentWeeklyNote


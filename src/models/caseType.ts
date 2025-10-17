import mongoose, { Schema, Document } from 'mongoose'

export interface ICaseType extends Document {
  label: string
  labelLower: string
  isActive: boolean
  sortOrder?: number
  createdAt: Date
  updatedAt: Date
}

const CaseTypeSchema: Schema = new Schema<ICaseType>(
  {
    label: { type: String, required: true, trim: true, maxlength: 64 },
    labelLower: { type: String, required: true, unique: true, index: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Keep labelLower in sync
CaseTypeSchema.pre('validate', function (next) {
  if (this.label) {
    this.label = this.label.trim()
    this.labelLower = this.label.toLowerCase()
  }
  next()
})

const CaseType = mongoose.model<ICaseType>('CaseType', CaseTypeSchema)

export default CaseType

export async function ensureDefaultCaseTypes(): Promise<void> {
  const count = await CaseType.estimatedDocumentCount()
  if (count > 0) return
  const defaults = [
    'Jatkuva buukkicase',
    'Soittotyö päivähinnalla',
    'Pilotti',
    'Haastattelut',
    'Kuuki',
  ]
  await CaseType.insertMany(
    defaults.map((label, idx) => ({ label, isActive: true, sortOrder: idx }))
  )
}



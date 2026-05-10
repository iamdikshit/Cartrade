import mongoose, { Schema, Document } from 'mongoose'

export interface IInquiry extends Document {
  _id: mongoose.Types.ObjectId
  car: mongoose.Types.ObjectId
  carName: string
  carId: string
  name: string
  email: string
  phone: string
  message: string
  status: 'new' | 'read' | 'replied' | 'closed'
  reply?: string
  repliedAt?: Date
  repliedBy?: mongoose.Types.ObjectId
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  updatedAt: Date
}

const inquirySchema = new Schema<IInquiry>(
  {
    car: { type: Schema.Types.ObjectId, ref: 'Car', required: true, index: true },
    carName: { type: String, required: true },
    carId: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    message: { type: String, required: true, maxlength: 1000 },
    status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new', index: true },
    reply: { type: String, maxlength: 2000 },
    repliedAt: Date,
    repliedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    ipAddress: { type: String, select: false },
    userAgent: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: unknown, ret: Record<string, unknown>) => {
        ret.ipAddress = undefined
        ret.userAgent = undefined
        ret.__v = undefined
        return ret
      },
    },
  }
)

inquirySchema.index({ createdAt: -1 })
inquirySchema.index({ status: 1, createdAt: -1 })

export const Inquiry = mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', inquirySchema)

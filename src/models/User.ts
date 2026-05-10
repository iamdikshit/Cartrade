import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export type UserRole = 'root' | 'admin' | 'employee'

export const PERMISSIONS = [
  'cars:create', 'cars:edit', 'cars:delete', 'cars:view',
  'inquiries:view', 'inquiries:reply', 'employees:manage',
] as const

export type Permission = typeof PERMISSIONS[number]

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password: string
  role: UserRole
  permissions: Permission[]
  phone?: string
  avatar?: string
  isActive: boolean
  mustChangePassword: boolean
  lastLogin?: Date
  loginAttempts: number
  lockUntil?: Date
  refreshTokens: string[]
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
  isLocked: boolean
  incrementLoginAttempts(): Promise<void>
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['root', 'admin', 'employee'], required: true },
    permissions: [{ type: String, enum: PERMISSIONS }],
    phone: String,
    avatar: String,
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    refreshTokens: { type: [String], default: [], select: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: unknown, ret: Record<string, unknown>) => {
        ret.password = undefined
        ret.refreshTokens = undefined
        ret.__v = undefined
        return ret
      },
    },
  }
)

userSchema.virtual('isLocked').get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date())
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
  this.password = await bcrypt.hash(this.password, rounds)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.incrementLoginAttempts = async function () {
  const LOCK_TIME = 2 * 60 * 60 * 1000
  const MAX_LOGIN_ATTEMPTS = 5
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({ $unset: { lockUntil: 1 }, $set: { loginAttempts: 1 } })
  }
  const updates: Record<string, unknown> = { $inc: { loginAttempts: 1 } }
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME) }
  }
  return this.updateOne(updates)
}

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

import mongoose, { Schema, Document } from 'mongoose'

export type ConditionStatus = 'ok' | 'repaired' | 'notOk'
export type CarStatus = 'active' | 'hold' | 'sold'

interface MediaItem {
  url: string
  type: 'image' | 'video'
  caption?: string
}

interface ComponentDetail {
  status: ConditionStatus
  notes?: string
  media?: MediaItem[]
}

export interface ICarRatings {
  exterior: number
  engine: number
  ac: number
  electrical: number
  steering: number
}

export interface ICar extends Document {
  _id: mongoose.Types.ObjectId
  carId: string
  name: string
  make: string
  carModel: string
  year: number
  variant?: string
  color?: string
  fuelType: 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid'
  transmission: 'manual' | 'automatic' | 'amt'
  odometer?: number
  price?: number
  askingPrice?: number
  status: CarStatus
  description?: string
  slug: string
  location?: {
    address?: string
    lat?: number
    lng?: number
    city?: string
    state?: string
  }
  images: Array<{
    url: string
    category: 'front' | 'back' | 'left' | 'right' | 'engine' | 'interior' | 'dashboard' | 'other'
    caption?: string
    isPrimary?: boolean
  }>
  ratings: ICarRatings
  documents: {
    rcAvailability: boolean
    insurance: 'yes' | 'no' | 'expired'
    roadTaxPaid: boolean
    hypothecation: boolean
    other: {
      duplicateKey: boolean
      chassisNumber: boolean
      partyPeshi: boolean
      pollutionNorm: 'BSIII' | 'BSIV' | 'BSVI'
    }
    registrationAndFitness: {
      manufacturingDate?: Date
      registrationDate?: Date
      rtoCode?: string
      rtoName?: string
      fitnessExpiry?: Date
    }
  }
  exteriorDetails: Record<string, ComponentDetail>
  exteriorPanels: Record<string, ComponentDetail>
  tyres: Record<string, ComponentDetail>
  windshieldLights: Record<string, ComponentDetail>
  engineDetails: Record<string, ComponentDetail>
  acDetails: Record<string, ComponentDetail>
  electricalDetails: Record<string, ComponentDetail>
  steeringDetails: Record<string, ComponentDetail>
  brakesSuspension: Record<string, ComponentDetail>
  views: number
  inquiryCount: number
  createdBy: mongoose.Types.ObjectId
  updatedBy?: mongoose.Types.ObjectId
  soldAt?: Date
  createdAt: Date
  updatedAt: Date
}

const mediaItemSchema = new Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  caption: String,
}, { _id: false })

const componentDetailSchema = new Schema({
  status: { type: String, enum: ['ok', 'repaired', 'notOk'], required: true },
  notes: String,
  media: [mediaItemSchema],
}, { _id: false })

const carSchema = new Schema<ICar>(
  {
    carId: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    make: { type: String, required: true, trim: true },
    carModel: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    variant: String,
    color: String,
    fuelType: { type: String, enum: ['petrol', 'diesel', 'cng', 'electric', 'hybrid'], required: true },
    transmission: { type: String, enum: ['manual', 'automatic', 'amt'], required: true },
    odometer: Number,
    price: Number,
    askingPrice: Number,
    status: { type: String, enum: ['active', 'hold', 'sold'], default: 'active', index: true },
    description: { type: String, maxlength: 2000 },
    slug: { type: String, unique: true, index: true },
    location: {
      address: String, lat: Number, lng: Number, city: String, state: String,
    },
    images: [{
      url: { type: String, required: true },
      category: { type: String, enum: ['front','back','left','right','engine','interior','dashboard','other'], default: 'other' },
      caption: String,
      isPrimary: { type: Boolean, default: false },
    }],
    ratings: {
      exterior:   { type: Number, min: 0, max: 5, default: 0 },
      engine:     { type: Number, min: 0, max: 5, default: 0 },
      ac:         { type: Number, min: 0, max: 5, default: 0 },
      electrical: { type: Number, min: 0, max: 5, default: 0 },
      steering:   { type: Number, min: 0, max: 5, default: 0 },
    },
    documents: {
      rcAvailability: { type: Boolean, default: false },
      insurance: { type: String, enum: ['yes', 'no', 'expired'], default: 'no' },
      roadTaxPaid: { type: Boolean, default: false },
      hypothecation: { type: Boolean, default: false },
      other: {
        duplicateKey:  { type: Boolean, default: false },
        chassisNumber: { type: Boolean, default: false },
        partyPeshi:    { type: Boolean, default: false },
        pollutionNorm: { type: String, enum: ['BSIII','BSIV','BSVI'], default: 'BSIV' },
      },
      registrationAndFitness: {
        manufacturingDate: Date,
        registrationDate:  Date,
        rtoCode: String,
        rtoName: String,
        fitnessExpiry: Date,
      },
    },
    exteriorDetails:   { type: Schema.Types.Mixed, default: {} },
    exteriorPanels:    { type: Schema.Types.Mixed, default: {} },
    tyres:             { type: Schema.Types.Mixed, default: {} },
    windshieldLights:  { type: Schema.Types.Mixed, default: {} },
    engineDetails:     { type: Schema.Types.Mixed, default: {} },
    acDetails:         { type: Schema.Types.Mixed, default: {} },
    electricalDetails: { type: Schema.Types.Mixed, default: {} },
    steeringDetails:   { type: Schema.Types.Mixed, default: {} },
    brakesSuspension:  { type: Schema.Types.Mixed, default: {} },
    views:          { type: Number, default: 0 },
    inquiryCount:   { type: Number, default: 0 },
    createdBy:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy:  { type: Schema.Types.ObjectId, ref: 'User' },
    soldAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

// ── Auto-generate carId and slug ──────────────────────────────────────────────
carSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.models.Car?.countDocuments() || 0
    this.carId = `CT${String(count + 1001).padStart(5, '0')}`

    // Use carModel (string) — NOT this.model (Mongoose method)
    const modelName = typeof this.carModel === 'string' ? this.carModel : ''
    const baseSlug  = `${this.make}-${modelName}-${this.year}-${this.carId}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    this.slug = baseSlug
  }

  if (this.status === 'sold' && !this.soldAt) {
    this.soldAt = new Date()
  }

  next()
})

carSchema.index({ make: 'text', carModel: 'text', name: 'text' })
carSchema.index({ status: 1, createdAt: -1 })
carSchema.index({ 'location.city': 1 })

export const Car = mongoose.models.Car || mongoose.model<ICar>('Car', carSchema)

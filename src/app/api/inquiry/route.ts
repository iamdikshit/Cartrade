import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Inquiry } from '@/models/Inquiry'
import { Car } from '@/models/Car'
import { inquirySchema } from '@/lib/validation'
import { sendInquiryEmail } from '@/lib/email'
import { apiRateLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rateLimit'
import { withAuth } from '@/lib/authMiddleware'
import { JWTPayload } from '@/lib/jwt'

// Public: Submit inquiry
export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request)
  const limitResult = apiRateLimiter(`inquiry:${clientId}`)
  if (!limitResult.success) return rateLimitResponse(limitResult.resetTime)

  try {
    const body = await request.json()
    const parseResult = inquirySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { carId, name, email, phone, message } = parseResult.data

    await connectDB()

    const car = await Car.findById(carId).select('name carId status')
    if (!car) return NextResponse.json({ error: 'Car not found' }, { status: 404 })
    if (car.status === 'sold') return NextResponse.json({ error: 'This car is already sold' }, { status: 400 })

    // Check for duplicate inquiry (same email + car in last 24h)
    const recentInquiry = await Inquiry.findOne({
      car: carId,
      email,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })

    if (recentInquiry) {
      return NextResponse.json(
        { error: 'You have already submitted an inquiry for this car in the last 24 hours' },
        { status: 429 }
      )
    }

    const inquiry = await Inquiry.create({
      car: carId,
      carName: car.name,
      carId: car.carId,
      name,
      email,
      phone,
      message,
      ipAddress: getClientIdentifier(request),
      userAgent: request.headers.get('user-agent'),
    })

    // Update car inquiry count
    Car.findByIdAndUpdate(carId, { $inc: { inquiryCount: 1 } }).exec()

    // Send email notification (non-blocking)
    sendInquiryEmail({
      carName: car.name,
      carId: car.carId,
      senderName: name,
      senderEmail: email,
      senderPhone: phone,
      message,
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully. We will contact you shortly.',
      inquiryId: inquiry._id,
    }, { status: 201 })
  } catch (error) {
    console.error('Inquiry error:', error)
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 })
  }
}

// Protected: Get all inquiries (admin)
async function getInquiries(request: NextRequest & { user: JWTPayload }) {
  if (!request.user.permissions.includes('inquiries:view') && request.user.role !== 'root') {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))
    const status = searchParams.get('status')

    await connectDB()

    const query: any = {}
    if (status) query.status = status

    const skip = (page - 1) * limit

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        .populate('car', 'name carId images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inquiry.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      inquiries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }
}

export const GET = withAuth(getInquiries)

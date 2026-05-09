import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Car } from '@/models/Car'
import { Inquiry } from '@/models/Inquiry'
import { withAuth } from '@/lib/authMiddleware'
import { JWTPayload } from '@/lib/jwt'

async function getStats(request: NextRequest & { user: JWTPayload }) {
  try {
    await connectDB()

    const [
      totalCars,
      activeCars,
      soldCars,
      holdCars,
      totalInquiries,
      newInquiries,
      recentCars,
      recentInquiries,
    ] = await Promise.all([
      Car.countDocuments(),
      Car.countDocuments({ status: 'active' }),
      Car.countDocuments({ status: 'sold' }),
      Car.countDocuments({ status: 'hold' }),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: 'new' }),
      Car.find()
        .select('carId name make model year images askingPrice status views slug')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Inquiry.find()
        .select('name email carName carId message status createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ])

    const viewsResult = await Car.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ])
    const totalViews = viewsResult[0]?.totalViews || 0

    return NextResponse.json({
      success: true,
      stats: {
        totalCars, activeCars, soldCars, holdCars,
        totalInquiries, newInquiries, totalViews,
        recentCars, recentInquiries,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

export const GET = withAuth(getStats)

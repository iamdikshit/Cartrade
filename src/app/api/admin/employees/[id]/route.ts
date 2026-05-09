import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/models/User'
import { withAuth } from '@/lib/authMiddleware'
import { JWTPayload } from '@/lib/jwt'

async function updateEmployee(
  request: NextRequest & { user: JWTPayload },
  { params }: { params: { id: string } }
) {
  if (request.user.role !== 'root') {
    return NextResponse.json({ error: 'Only root admin can modify employees' }, { status: 403 })
  }

  try {
    const body = await request.json()
    await connectDB()

    const employee = await User.findByIdAndUpdate(
      params.id,
      { ...body },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens')

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, employee })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
  }
}

export const PATCH = withAuth(updateEmployee)

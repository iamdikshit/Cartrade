import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Inquiry } from '@/models/Inquiry'
import { withAuth } from '@/lib/authMiddleware'
import { JWTPayload } from '@/lib/jwt'

async function updateInquiry(
  request: NextRequest & { user: JWTPayload },
  { params }: { params: { id: string } }
) {
  if (!request.user.permissions.includes('inquiries:view') && request.user.role !== 'root') {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { status, reply } = body

    await connectDB()

    const updateData: any = {}
    if (status) updateData.status = status
    if (reply) {
      updateData.reply = reply
      updateData.repliedAt = new Date()
      updateData.repliedBy = request.user.userId
      updateData.status = 'replied'
    }

    const inquiry = await Inquiry.findByIdAndUpdate(params.id, updateData, { new: true })
    if (!inquiry) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })

    return NextResponse.json({ success: true, inquiry })
  } catch {
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }
}

export const PATCH = withAuth(updateInquiry)

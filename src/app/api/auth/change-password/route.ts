import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/models/User'
import { withAuth } from '@/lib/authMiddleware'
import { JWTPayload } from '@/lib/jwt'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and number'),
})

async function changePassword(request: NextRequest & { user: JWTPayload }) {
  try {
    const body = await request.json()
    const parseResult = changePasswordSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = parseResult.data

    await connectDB()
    const user = await User.findById(request.user.userId).select('+password')
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const isValid = await user.comparePassword(currentPassword)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    user.password = newPassword
    user.mustChangePassword = false
    await user.save()

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}

export const POST = withAuth(changePassword)

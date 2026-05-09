import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/models/User'
import { signAccessToken, verifyRefreshToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
    }

    const payload = verifyRefreshToken(refreshToken)
    await connectDB()

    const user = await User.findById(payload.userId).select('+refreshTokens')
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 })
    }

    if (!user.refreshTokens?.includes(refreshToken)) {
      // Token reuse detected - revoke all tokens
      user.refreshTokens = []
      await user.save()
      return NextResponse.json({ error: 'Invalid refresh token - security breach detected' }, { status: 401 })
    }

    const newPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    }

    const newAccessToken = signAccessToken(newPayload)
    const newRefreshToken = signAccessToken(newPayload) // rotate refresh token

    // Update stored refresh tokens
    user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken)
    user.refreshTokens.push(newRefreshToken)
    await user.save()

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
    })

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/api/auth',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }
}

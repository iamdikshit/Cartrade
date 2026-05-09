import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/models/User'
import { verifyRefreshToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken)
        await connectDB()
        await User.findByIdAndUpdate(payload.userId, {
          $pull: { refreshTokens: refreshToken },
        })
      } catch {
        // Token invalid, just clear cookie
      }
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete('refreshToken')
    return response
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}

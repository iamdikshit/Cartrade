import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/models/User'
import { signAccessToken, signRefreshToken } from '@/lib/jwt'
import { loginSchema } from '@/lib/validation'
import { authRateLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request)
  const limitResult = authRateLimiter(clientId)
  if (!limitResult.success) {
    return rateLimitResponse(limitResult.resetTime)
  }

  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = loginSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, password } = parseResult.data

    await connectDB()

    // Find user
    const user = await User.findOne({ email }).select('+password +refreshTokens')
    
    if (!user) {
      // Timing attack prevention - still do bcrypt work
      await new Promise(resolve => setTimeout(resolve, 200))
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated. Contact root admin.' }, { status: 403 })
    }

    if (user.isLocked) {
      return NextResponse.json(
        { error: 'Account is temporarily locked due to too many failed attempts. Try again in 2 hours.' },
        { status: 423 }
      )
    }

    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      await user.incrementLoginAttempts?.()
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Reset login attempts on success
    user.loginAttempts = 0
    user.lockUntil = undefined
    user.lastLogin = new Date()

    // Generate tokens
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken({ userId: user._id.toString() })

    // Store refresh token (keep only last 5)
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken]
    await user.save()

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        mustChangePassword: user.mustChangePassword,
      },
      accessToken,
    })

    // Set refresh token as httpOnly cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/api/auth',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

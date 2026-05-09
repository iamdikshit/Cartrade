import { NextRequest, NextResponse } from 'next/server'

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export function rateLimit(config: RateLimitConfig) {
  return function checkRateLimit(identifier: string): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const windowMs = config.windowMs
    const maxRequests = config.maxRequests

    const key = identifier
    const record = requestCounts.get(key)

    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs
      requestCounts.set(key, { count: 1, resetTime })
      return { success: true, remaining: maxRequests - 1, resetTime }
    }

    if (record.count >= maxRequests) {
      return { success: false, remaining: 0, resetTime: record.resetTime }
    }

    record.count++
    return { success: true, remaining: maxRequests - record.count, resetTime: record.resetTime }
  }
}

// Cleanup old records every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key)
    }
  }
}, 10 * 60 * 1000)

export const authRateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 })
export const apiRateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 100 })
export const uploadRateLimiter = rateLimit({ windowMs: 60 * 1000, maxRequests: 20 })

export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
  return ip
}

export function rateLimitResponse(resetTime: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
        'X-RateLimit-Reset': String(resetTime),
      },
    }
  )
}

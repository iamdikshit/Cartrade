import { NextRequest, NextResponse } from 'next/server'

const requestCounts = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export function rateLimit(config: RateLimitConfig) {
  return function checkRateLimit(identifier: string): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const { windowMs, maxRequests } = config
    const record = requestCounts.get(identifier)

    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs
      requestCounts.set(identifier, { count: 1, resetTime })
      return { success: true, remaining: maxRequests - 1, resetTime }
    }

    if (record.count >= maxRequests) {
      return { success: false, remaining: 0, resetTime: record.resetTime }
    }

    record.count++
    return { success: true, remaining: maxRequests - record.count, resetTime: record.resetTime }
  }
}

setInterval(() => {
  const now = Date.now()
  Array.from(requestCounts.entries()).forEach(([key, record]) => {
    if (now > record.resetTime) requestCounts.delete(key)
  })
}, 10 * 60 * 1000)

export const authRateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 10 })
export const apiRateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 100 })
export const uploadRateLimiter = rateLimit({ windowMs: 60 * 1000, maxRequests: 20 })

export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
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

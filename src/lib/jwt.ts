import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export interface JWTPayload {
  userId: string
  email: string
  role: 'root' | 'admin' | 'employee'
  permissions: string[]
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'car-trade',
    audience: 'car-trade-api',
  })
}

export function signRefreshToken(payload: Pick<JWTPayload, 'userId'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    issuer: 'car-trade',
    audience: 'car-trade-refresh',
  })
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'car-trade',
    audience: 'car-trade-api',
  }) as JWTPayload
}

export function verifyRefreshToken(token: string): Pick<JWTPayload, 'userId'> {
  return jwt.verify(token, JWT_REFRESH_SECRET, {
    issuer: 'car-trade',
    audience: 'car-trade-refresh',
  }) as Pick<JWTPayload, 'userId'>
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.substring(7)
}

import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, extractTokenFromHeader, JWTPayload } from '@/lib/jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

type RouteHandler = (request: NextRequest, context: any) => Promise<NextResponse>

export function withAuth(handler: (request: NextRequest & { user: JWTPayload }, context: any) => Promise<NextResponse>, requiredPermissions?: string[]) {
  return async function (request: NextRequest, context: any): Promise<NextResponse> {
    try {
      const token = extractTokenFromHeader(request.headers.get('authorization'))
      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const payload = verifyAccessToken(token)

      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.every(
          (perm) => payload.permissions.includes(perm) || payload.role === 'root'
        )
        if (!hasPermission) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      // Attach user to request
      ;(request as any).user = payload
      return handler(request as NextRequest & { user: JWTPayload }, context)
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json({ error: 'Token expired', code: 'TOKEN_EXPIRED' }, { status: 401 })
      }
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
  }
}

export function withRole(handler: RouteHandler, allowedRoles: string[]) {
  return async function (request: NextRequest, context: any): Promise<NextResponse> {
    try {
      const token = extractTokenFromHeader(request.headers.get('authorization'))
      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }

      const payload = verifyAccessToken(token)
      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      ;(request as any).user = payload
      return handler(request, context)
    } catch {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
  }
}

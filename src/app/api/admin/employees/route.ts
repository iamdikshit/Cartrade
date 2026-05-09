import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/models/User'
import { withAuth } from '@/lib/authMiddleware'
import { createEmployeeSchema } from '@/lib/validation'
import { sendWelcomeEmail } from '@/lib/email'
import { JWTPayload } from '@/lib/jwt'

async function getEmployees(request: NextRequest & { user: JWTPayload }) {
  if (!['root', 'admin'].includes(request.user.role)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    await connectDB()
    const employees = await User.find({ role: { $in: ['admin', 'employee'] } })
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, employees })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

async function createEmployee(request: NextRequest & { user: JWTPayload }) {
  if (request.user.role !== 'root') {
    return NextResponse.json({ error: 'Only root admin can create employees' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const parseResult = createEmployeeSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, password, permissions, phone } = parseResult.data

    await connectDB()

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const employee = new User({
      name,
      email,
      password,
      role: 'employee',
      permissions,
      phone,
      createdBy: request.user.userId,
      mustChangePassword: true,
    })

    await employee.save()

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name, password).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        permissions: employee.permissions,
      },
    }, { status: 201 })
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}

export const GET = withAuth(getEmployees)
export const POST = withAuth(createEmployee)

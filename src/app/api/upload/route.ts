import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/jwt'
import { uploadRateLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rateLimit'

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/heic', 'image/heif', 'image/avif', 'image/gif',
]
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/3gpp']
const MAX_IMAGE_SIZE = 15 * 1024 * 1024
const MAX_VIDEO_SIZE = 100 * 1024 * 1024

const USE_S3 = !!(
  process.env.AWS_S3_BUCKET &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
)

async function uploadToS3(buffer: Buffer, filename: string, mimeType: string, folder: string): Promise<string> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
  const client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
  const key = `uploads/${folder}/${filename}`
  await client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    CacheControl: 'max-age=31536000',
  }))
  if (process.env.AWS_CLOUDFRONT_URL) return `${process.env.AWS_CLOUDFRONT_URL}/${key}`
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`
}

async function uploadToLocal(buffer: Buffer, filename: string, carId: string, category: string): Promise<string> {
  const uploadDir = join(process.cwd(), 'public', 'uploads', carId, category)
  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, filename), buffer)
  return `/uploads/${carId}/${category}/${filename}`
}

function isLikelyImage(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false
  const jpg = buffer[0] === 0xFF && buffer[1] === 0xD8
  const png = buffer[0] === 0x89 && buffer[1] === 0x50
  const webp = buffer.length > 11 && buffer[8] === 0x57 && buffer[9] === 0x45
  const gif = buffer[0] === 0x47 && buffer[1] === 0x49
  const modern = ['image/heic', 'image/heif', 'image/avif'].includes(mimeType)
  return jpg || png || webp || gif || modern
}

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request)
  const limitResult = uploadRateLimiter(clientId)
  if (!limitResult.success) return rateLimitResponse(limitResult.resetTime)

  const token = extractTokenFromHeader(request.headers.get('authorization'))

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    verifyAccessToken(token)
  } catch (err: any) {
    // Token expired — tell client to refresh and retry
    if (err?.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Token expired', code: 'TOKEN_EXPIRED' },
        { status: 401 }
      )
    }
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const category = (formData.get('category') as string) || 'other'
    const carId = (formData.get('carId') as string) || 'general'

    if (!files || files.length === 0)
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    if (files.length > 10)
      return NextResponse.json({ error: 'Maximum 10 files per upload' }, { status: 400 })

    const uploadedFiles = []

    for (const file of files) {
      const mimeType = file.type.toLowerCase()
      const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType)
      const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType)

      if (!isImage && !isVideo) {
        return NextResponse.json({ error: `File type "${file.type}" not allowed.` }, { status: 400 })
      }

      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
      if (file.size > maxSize) {
        return NextResponse.json({ error: `File too large. Max: ${isVideo ? '100MB' : '15MB'}` }, { status: 400 })
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      if (isImage && !isLikelyImage(buffer, mimeType)) {
        return NextResponse.json({ error: `File "${file.name}" appears invalid` }, { status: 400 })
      }

      let ext = extname(file.name).toLowerCase()
      if (!ext) {
        const extMap: Record<string, string> = {
          'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png',
          'image/webp': '.webp', 'image/heic': '.heic', 'image/heif': '.heif',
          'image/avif': '.avif', 'image/gif': '.gif',
          'video/mp4': '.mp4', 'video/quicktime': '.mov', 'video/webm': '.webm',
        }
        ext = extMap[mimeType] || '.bin'
      }

      const filename = `${uuidv4()}${ext}`
      const url = USE_S3
        ? await uploadToS3(buffer, filename, mimeType, `${carId}/${category}`)
        : await uploadToLocal(buffer, filename, carId, category)

      uploadedFiles.push({
        url,
        type: isImage ? 'image' : 'video',
        originalName: file.name,
        size: file.size,
        category,
        storage: USE_S3 ? 's3' : 'local',
      })
    }

    return NextResponse.json({ success: true, files: uploadedFiles })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

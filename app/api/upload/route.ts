import { NextResponse } from 'next/server'
import { Storage } from '@google-cloud/storage'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth.config'

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS!)
})

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET!)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { filename, contentType } = await request.json()
    
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate a unique file key
    const fileKey = `uploads/${Date.now()}-${filename}`
    const file = bucket.file(fileKey)

    // Generate a signed URL for upload
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType,
    })

    // Generate a signed URL for reading (public URL)
    const [publicUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
    })

    return NextResponse.json({
      uploadUrl,
      fileUrl: publicUrl,
    })
  } catch (error) {
    console.error('Error generating upload URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
} 
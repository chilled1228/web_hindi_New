import { NextResponse } from 'next/server'
import { handleCors, applyCorsHeaders } from '@/lib/cors'
import type { NextRequest } from 'next/server'

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return handleCors(req);
}

export async function POST(req: NextRequest) {
  // Handle CORS preflight
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  try {
    const { filename, contentType } = await req.json()
    
    if (!filename || !contentType) {
      const errorResponse = NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
      return applyCorsHeaders(errorResponse, req);
    }

    // Generate a mock URL for now
    // You can implement your preferred storage solution here
    const mockUrl = `/uploads/${Date.now()}-${filename}`

    const successResponse = NextResponse.json({
      uploadUrl: mockUrl,
      fileUrl: mockUrl,
    }, { status: 200 });
    
    return applyCorsHeaders(successResponse, req);
  } catch (error) {
    console.error('Error handling upload:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to handle upload' },
      { status: 500 }
    );
    return applyCorsHeaders(errorResponse, req);
  }
} 
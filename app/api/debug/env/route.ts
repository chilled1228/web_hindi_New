import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { corsHeaders, applyCorsHeaders } from '@/lib/cors';

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders(req) });
}

export async function GET(req: NextRequest) {
  // Check if the request is authenticated (in production)
  // This is a simple check - you should implement proper authentication
  const authHeader = req.headers.get('authorization');
  const isAuthorized = process.env.NODE_ENV !== 'production' || 
                       (authHeader && authHeader === `Bearer ${process.env.DEBUG_API_KEY}`);
  
  if (!isAuthorized) {
    const response = NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
    return applyCorsHeaders(response, req);
  }

  // Get environment variables status (not the actual values for security)
  const envStatus = {
    firebase: {
      admin: {
        FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
        FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
      },
      client: {
        NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      }
    },
    other: {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    }
  };

  const response = NextResponse.json(
    { 
      status: 'ok',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      envStatus
    },
    { status: 200 }
  );
  
  return applyCorsHeaders(response, req);
} 
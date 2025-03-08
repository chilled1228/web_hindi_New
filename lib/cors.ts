import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.NEXT_PUBLIC_BASE_URL || '',
      'https://hinidiblog.vercel.app', // Add your Vercel domain
    ]
  : ['http://localhost:3000'];

/**
 * Apply CORS headers to a response
 */
export function corsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin') || '';
  const isAllowedOrigin = allowedOrigins.includes(origin) || 
                          allowedOrigins.some(allowed => allowed && origin.endsWith(allowed));
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export function handleCors(req: NextRequest) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders(req) });
  }
  
  return null;
}

/**
 * Apply CORS headers to a response
 */
export function applyCorsHeaders(response: NextResponse, req: NextRequest) {
  const headers = corsHeaders(req);
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
} 
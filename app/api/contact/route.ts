import { NextResponse } from 'next/server';
import { handleCors, applyCorsHeaders } from '@/lib/cors';
import type { NextRequest } from 'next/server';

const RECAPTCHA_SECRET_KEY = '6LeKB7AqAAAAAGqhE46y-syWSYAYQ6ZcHegFdy66';

async function verifyRecaptcha(token: string) {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
  });

  const data = await response.json();
  return data.success;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return handleCors(req);
}

export async function POST(req: NextRequest) {
  // Handle CORS preflight
  const corsResult = handleCors(req);
  if (corsResult) return corsResult;

  try {
    const body = await req.json();
    const { name, email, message, recaptchaToken } = body;

    // Verify reCAPTCHA token
    const isVerified = await verifyRecaptcha(recaptchaToken);
    
    if (!isVerified) {
      const errorResponse = NextResponse.json(
        { error: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
      return applyCorsHeaders(errorResponse, req);
    }

    // Here you would typically:
    // 1. Validate the input data
    // 2. Send email
    // 3. Store in database
    // 4. etc.

    // For now, we'll just return success
    const successResponse = NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );
    return applyCorsHeaders(successResponse, req);

  } catch (error) {
    console.error('Error processing contact form:', error);
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return applyCorsHeaders(errorResponse, req);
  }
} 
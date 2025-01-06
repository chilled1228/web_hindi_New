import { NextResponse } from 'next/server';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, recaptchaToken } = body;

    // Verify reCAPTCHA token
    const isVerified = await verifyRecaptcha(recaptchaToken);
    
    if (!isVerified) {
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Validate the input data
    // 2. Send email
    // 3. Store in database
    // 4. etc.

    // For now, we'll just return success
    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
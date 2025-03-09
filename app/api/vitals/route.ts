import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the metrics to the console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals:', body);
    }
    
    // In production, you might want to store these metrics in a database
    // or send them to an analytics service
    
    // Example: Send to Google Analytics
    // const ga = await import('firebase/analytics');
    // ga.logEvent(getAnalytics(), 'web_vitals', body);
    
    // Example: Send to a logging service
    // await fetch('https://your-logging-service.com/api/log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(body),
    // });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Web Vitals:', error);
    return NextResponse.json(
      { error: 'Failed to process Web Vitals' },
      { status: 500 }
    );
  }
}

// Enable CORS for this endpoint
export const config = {
  cors: {
    origin: '*',
    methods: ['POST'],
  },
}; 
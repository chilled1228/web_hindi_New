import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Initialize the Gemini API with your API key
let genAI: GoogleGenerativeAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not configured in environment variables');
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('Gemini API initialized successfully');
} catch (error) {
  console.error('Error initializing Gemini API:', error);
}

export async function POST(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to use this feature' },
        { status: 401 }
      )
    }

    // Check rate limits
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Use a transaction to check and update prompt usage atomically
    const { data: usageResult, error: transactionError } = await supabase.rpc('check_and_track_prompt_usage', {
      user_id_param: session.user.id,
      start_date_param: startOfMonth.toISOString(),
      prompt_type_param: 'image'
    })

    if (transactionError) {
      console.error('Transaction error:', transactionError)
      return NextResponse.json(
        { error: 'Failed to process prompt usage', details: transactionError.message },
        { status: 500 }
      )
    }

    if (!usageResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'You have reached your monthly prompt generation limit',
          used: usageResult.used_prompts,
          limit: usageResult.prompt_limit
        },
        { status: 429 }
      )
    }

    // Validate API initialization
    if (!genAI) {
      console.error('Gemini API not initialized');
      return NextResponse.json(
        { 
          error: 'API configuration error',
          message: 'The Gemini API could not be initialized. Please check your API key format and configuration.',
          help: 'Make sure to use a valid API key from Google AI Studio (https://makersuite.google.com/app/apikey)',
          env: {
            hasApiKey: !!process.env.GEMINI_API_KEY,
            hasModel: !!process.env.GEMINI_MODEL,
            hasPrompt: !!process.env.GEMINI_PROMPT
          }
        },
        { status: 500 }
      )
    }

    const { image, mimeType } = await request.json()

    // Validate request data
    if (!image || !mimeType) {
      console.error('Missing required fields:', { image: !!image, mimeType: !!mimeType });
      return NextResponse.json(
        { error: 'Missing required fields', details: { hasImage: !!image, hasMimeType: !!mimeType } },
        { status: 400 }
      )
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp" })

    // Prepare the image data
    const imageData = {
      inlineData: {
        data: image,
        mimeType
      }
    }

    console.log('Sending request to Gemini API...', {
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
      prompt: process.env.GEMINI_PROMPT,
      mimeType
    })

    // Generate content
    const result = await model.generateContent([
      process.env.GEMINI_PROMPT || "Generate a detailed 100-word photography description including lens choice and lighting setup for this image:",
      imageData
    ])

    const response = await result.response
    const prompt = response.text()

    console.log('Generated prompt:', prompt)

    if (!prompt) {
      console.error('No prompt was generated');
      throw new Error('No prompt generated')
    }

    return NextResponse.json({ prompt })
  } catch (error: any) {
    console.error('Error generating prompt:', {
      message: error.message,
      stack: error.stack,
      details: error,
      status: error.status,
      errorDetails: error.errorDetails,
      env: {
        hasApiKey: !!process.env.GEMINI_API_KEY,
        hasModel: !!process.env.GEMINI_MODEL,
        hasPrompt: !!process.env.GEMINI_PROMPT
      }
    })
    
    // Enhanced error response
    return NextResponse.json(
      { 
        error: 'Failed to generate prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error.errorDetails || error.message,
        env: {
          hasApiKey: !!process.env.GEMINI_API_KEY,
          hasModel: !!process.env.GEMINI_MODEL,
          hasPrompt: !!process.env.GEMINI_PROMPT
        }
      },
      { status: error.status || 500 }
    )
  }
} 
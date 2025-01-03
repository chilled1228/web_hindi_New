import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { parseAndCleanJsonOutput } from '@/lib/utils'

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
          }
        },
        { status: 500 }
      )
    }

    const { image, mimeType, promptType = 'photography' } = await request.json()

    // Validate request data
    if (!image || !mimeType || !promptType) {
      console.error('Missing required fields:', { image: !!image, mimeType: !!mimeType, promptType: !!promptType });
      return NextResponse.json(
        { error: 'Missing required fields', details: { hasImage: !!image, hasMimeType: !!mimeType, hasPromptType: !!promptType } },
        { status: 400 }
      )
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp" })

    // Define prompt templates for different types
    const promptTemplates = {
      photography: {
        format: `{
          "output": "string" // Act as a stable diffusion photography prompt generator that accepts a visual description and outputs a detailed paragraph of 100 words that I can copy into my diffusion model. Include a variety of photography-related terminology including the description of the lens you use and most importantly a description of the lighting.
        }`,
        instruction: "Analyze this image and provide a detailed photography-focused description"
      },
      painting: {
        format: `{
          "output": "string" // Act as an art prompt generator that describes the image in terms of artistic style, composition, color palette, brushwork, and medium. Provide a detailed 100-word description suitable for an art generation model.
        }`,
        instruction: "Analyze this image and provide a detailed artistic interpretation"
      },
      character: {
        format: `{
          "output": "string" // Act as a character design prompt generator that describes the subject's appearance, pose, expression, clothing, and notable features in detail. Provide a 100-word description suitable for character generation.
        }`,
        instruction: "Analyze this image and provide a detailed character description"
      }
    }

    const selectedTemplate = promptTemplates[promptType as keyof typeof promptTemplates] || promptTemplates.photography
    const systemPrompt = `${selectedTemplate.instruction}. Reply with only the JSON object and do not mention names of real people, locations, or copyrighted terms, and do not capitalize every word. ${selectedTemplate.format}`

    // Prepare the image data
    const imageData = {
      inlineData: {
        data: image,
        mimeType
      }
    }

    console.log('Sending request to Gemini API...', {
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
      prompt: systemPrompt,
      mimeType
    })

    // Generate content
    const result = await model.generateContent([
      systemPrompt,
      imageData
    ])

    const response = await result.response
    const rawText = response.text()
    
    try {
      // Parse and clean the response
      const cleanOutput = parseAndCleanJsonOutput(rawText);

      if (!cleanOutput) {
        throw new Error('No output generated');
      }

      // Store the prompt history
      const { error: historyError } = await supabase
        .from('prompt_history')
        .insert({
          user_id: session.user.id,
          prompt_type: promptType,
          input_image: image,
          output_text: cleanOutput
        });

      if (historyError) {
        console.error('Error storing prompt history:', historyError);
      }

      // Only return the cleaned output
      return NextResponse.json({ 
        output: cleanOutput
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error processing response:', error);
      return NextResponse.json({
        error: 'Failed to process response',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
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
      }
    })
    
    return NextResponse.json({
      error: 'Failed to generate prompt',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error.errorDetails || error.message,
      env: {
        hasApiKey: !!process.env.GEMINI_API_KEY,
        hasModel: !!process.env.GEMINI_MODEL,
      }
    }, {
      status: error.status || 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
} 
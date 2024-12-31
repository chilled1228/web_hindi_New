import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { image, mimeType } = await request.json()

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp" })

    // Prepare the image data
    const imageData = {
      inlineData: {
        data: image,
        mimeType
      }
    }

    console.log('Sending request to Gemini API...')
    
    // Generate content
    const result = await model.generateContent([
      process.env.GEMINI_PROMPT || "Generate a detailed description of this image that could be used as a prompt for an AI image generator. Focus on the visual elements, style, composition, lighting, and mood. Make it descriptive but concise.",
      imageData
    ])

    const response = await result.response
    const prompt = response.text()

    console.log('Generated prompt:', prompt)

    if (!prompt) {
      throw new Error('No prompt generated')
    }

    return NextResponse.json({ prompt })
  } catch (error: any) {
    console.error('Error generating prompt:', error)
    return NextResponse.json(
      { error: 'Failed to generate prompt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
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
      process.env.GEMINI_PROMPT || "Act as a stable diffusion photography prompt generator that accepts a visual description and outputs a detailed paragraph of 100 words that I can copy into my diffusion model. Include a variety of photography-related terminology including the description of the lens you use and most importantly a description of the lighting. Now give me a clear and concise natural language visual description of the image:",
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
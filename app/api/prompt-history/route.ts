import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, getApps, cert } from 'firebase-admin/app'

// Initialize Firebase Admin if it hasn't been initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  })
}

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the token
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await getAuth().verifyIdToken(token)
    const userId = decodedToken.uid

    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const lastDocId = searchParams.get('lastDocId') || undefined

    // Get the history from Firebase
    const { getPromptHistory } = await import('@/lib/firebase-db')
    const history = await getPromptHistory(userId, pageSize, lastDocId)

    return NextResponse.json(history)
  } catch (error) {
    console.error('Error in prompt history API:', error)
    return NextResponse.json(
      { 
        error: 'Server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the token
    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await getAuth().verifyIdToken(token)
    const userId = decodedToken.uid

    // Get the request body
    const body = await request.json()
    
    // Save the prompt to history
    const { savePromptToHistory } = await import('@/lib/firebase-db')
    const savedPrompt = await savePromptToHistory({
      userId,
      promptType: body.promptType,
      inputImage: body.inputImage,
      outputText: body.outputText,
    })

    return NextResponse.json(savedPrompt)
  } catch (error) {
    console.error('Error in prompt history API:', error)
    return NextResponse.json(
      { 
        error: 'Server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
} 
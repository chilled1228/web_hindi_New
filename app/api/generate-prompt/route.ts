import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { parseAndCleanJsonOutput } from '@/lib/utils'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin
if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
  throw new Error('Firebase Admin environment variables are missing');
}

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin app if not already initialized
const firebaseAdmin = 
  getApps().length === 0 
    ? initializeApp({
        credential: cert(firebaseAdminConfig),
      })
    : getApps()[0];

const auth = getAuth(firebaseAdmin);
const db = getFirestore(firebaseAdmin);

// Credit management functions
async function getUserCredits(userId: string): Promise<number> {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.warn('User document not found:', userId);
      return 0;
    }
    
    const userData = userDoc.data();
    return userData?.credits || 0;
  } catch (error) {
    console.error('Error getting user credits:', error);
    throw error;
  }
}

async function updateUserCredits(userId: string, newCredits: number) {
  try {
    if (newCredits < 0) {
      throw new Error('Credits cannot be negative');
    }
    
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      credits: newCredits,
      lastUpdated: new Date().toISOString(),
    });
    
    console.log('Updated credits for user:', userId, 'New credits:', newCredits);
  } catch (error) {
    console.error('Error updating user credits:', error);
    throw error;
  }
}

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

// Add this helper function before the POST handler
async function retryWithBackoff(fn: () => Promise<any>, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.status === 503 && retries < maxRetries - 1) {
        retries++;
        const delay = initialDelay * Math.pow(2, retries - 1); // Exponential backoff
        console.log(`Retrying after ${delay}ms (attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Verify the token
    let userId: string;
    try {
      const token = authHeader.split('Bearer ')[1]
      const decodedToken = await auth.verifyIdToken(token)
      userId = decodedToken.uid
    } catch (error) {
      console.error('Error verifying auth token:', error)
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Check user's credits
    let credits: number;
    try {
      credits = await getUserCredits(userId)
      console.log('Retrieved credits for user:', userId, 'Credits:', credits);
      
      if (credits === 0) {
        return NextResponse.json(
          { error: 'Insufficient Credits', message: 'No credits remaining. Please purchase more credits.' },
          { status: 403 }
        )
      }

      // Update credits BEFORE generating content to prevent usage without credits
      await updateUserCredits(userId, credits - 1)
      console.log('Successfully updated credits for user:', userId, 'New credits:', credits - 1);
    } catch (error) {
      console.error('Error checking/updating user credits:', error);
      
      // Check if it's a Firestore error
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          return NextResponse.json(
            { error: 'Access Denied', message: 'You do not have permission to access credits' },
            { status: 403 }
          )
        } else if (error.message.includes('not-found')) {
          // Initialize credits for new user
          try {
            await db.collection('users').doc(userId).set({
              credits: 10, // Default credits for new user
              createdAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
            });
            credits = 10;
            console.log('Initialized credits for new user:', userId);
          } catch (initError) {
            console.error('Error initializing user credits:', initError);
            return NextResponse.json(
              { error: 'Initialization Failed', message: 'Unable to initialize user credits' },
              { status: 500 }
            )
          }
        } else {
          return NextResponse.json(
            { error: 'Credit Check Failed', message: 'Unable to verify user credits: ' + error.message },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Credit Check Failed', message: 'Unable to verify user credits' },
          { status: 500 }
        )
      }
    }

    const { image, mimeType, promptType } = await request.json()

    if (!image || !mimeType || !promptType) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp"
    })

    const promptTemplates = {
      photography: {
        format: `{"output": "string"}`,
        instruction: "Analyze this image and provide a detailed photography-focused description"
      },
      painting: {
        format: `{"output": "string"}`,
        instruction: "Analyze this image and provide a detailed artistic interpretation"
      },
      character: {
        format: `{"output": "string"}`,
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

    // Generate content with retry logic
    const result = await retryWithBackoff(async () => {
      return await model.generateContent([
        systemPrompt,
        imageData
      ]);
    });

    const response = await result.response
    const rawText = response.text()
    
    try {
      // Parse and clean the response
      const cleanOutput = parseAndCleanJsonOutput(rawText);

      if (!cleanOutput) {
        throw new Error('No output generated');
      }

      // Return the cleaned output
      return NextResponse.json({ 
        output: cleanOutput,
        creditsRemaining: credits - 1
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error processing response:', error);
      return NextResponse.json({
        error: 'Processing Failed',
        message: error instanceof Error ? error.message : 'Failed to process response'
      }, {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Error in generate prompt API:', error);
    return NextResponse.json(
      { 
        error: 'Server Error', 
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
} 
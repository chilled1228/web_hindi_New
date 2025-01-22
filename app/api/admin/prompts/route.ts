import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, cert, getApps } from 'firebase-admin/app'

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

export async function POST(request: Request) {
  try {
    // Get the authorization token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get user claims
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user exists and is admin
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      return new Response('Forbidden', { status: 403 });
    }

    // Parse the request body
    const data = await request.json();
    const { title, description, promptText, category, imageUrl } = data;

    // Validate required fields
    if (!title || !description || !promptText || !category || !imageUrl) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Create the prompt
    const promptRef = db.collection('prompts').doc();
    await promptRef.set({
      title,
      description,
      promptText,
      category,
      imageUrl,
      createdAt: new Date().toISOString(),
      createdBy: decodedToken.uid,
      views: 0,
      favorites: 0,
      featured: false,
    });

    return Response.json({ 
      success: true, 
      promptId: promptRef.id 
    });

  } catch (error) {
    console.error('Error creating prompt:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 
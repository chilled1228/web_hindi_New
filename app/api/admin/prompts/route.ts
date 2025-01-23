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
    const { id, title, description, promptText, category, imageUrl, additionalImages } = data;

    // Validate required fields
    if (!title || !description || !promptText || !category || !imageUrl) {
      return new Response('Missing required fields', { status: 400 });
    }

    // If id is provided, update existing prompt
    if (id) {
      const promptRef = db.collection('prompts').doc(id);
      await promptRef.update({
        title,
        description,
        promptText,
        category,
        imageUrl,
        additionalImages: additionalImages || [],
        updatedAt: new Date().toISOString(),
        updatedBy: decodedToken.uid,
      });

      return Response.json({ 
        success: true, 
        message: 'Prompt updated successfully',
        promptId: id 
      });
    }

    // Create new prompt
    const promptRef = db.collection('prompts').doc();
    await promptRef.set({
      title,
      description,
      promptText,
      category,
      imageUrl,
      additionalImages: additionalImages || [],
      createdAt: new Date().toISOString(),
      createdBy: decodedToken.uid,
      views: 0,
      favorites: 0,
      featured: false,
    });

    return Response.json({ 
      success: true, 
      message: 'Prompt created successfully',
      promptId: promptRef.id 
    });

  } catch (error) {
    console.error('Error creating/updating prompt:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
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

    // Get the prompt ID from the URL
    const url = new URL(request.url);
    const promptId = url.searchParams.get('id');
    
    if (!promptId) {
      return new Response('Missing prompt ID', { status: 400 });
    }

    // Delete the prompt
    await db.collection('prompts').doc(promptId).delete();

    return Response.json({ 
      success: true,
      message: 'Prompt deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting prompt:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 
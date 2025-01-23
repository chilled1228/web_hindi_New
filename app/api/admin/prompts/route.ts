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

// Function to generate URL-friendly slug
async function generateUniqueSlug(title: string, db: FirebaseFirestore.Firestore): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens

  // Check if the base slug exists
  const snapshot = await db.collection('prompts')
    .where('slug', '>=', baseSlug)
    .where('slug', '<=', baseSlug + '\uf8ff')
    .get();

  if (snapshot.empty) {
    return baseSlug;
  }

  // Find the highest number suffix
  const existingSlugs = snapshot.docs.map(doc => doc.data().slug);
  let counter = 1;
  let newSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}

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
      const promptDoc = await promptRef.get();
      
      if (!promptDoc.exists) {
        return new Response('Prompt not found', { status: 404 });
      }

      const currentData = promptDoc.data();
      
      // Only generate new slug if title has changed
      let newSlug = id;
      if (currentData?.title !== title) {
        newSlug = await generateUniqueSlug(title, db);
        
        if (newSlug !== id) {
          // Create new document with new slug
          const newPromptRef = db.collection('prompts').doc(newSlug);
          
          // Copy data to new document with updated fields
          await newPromptRef.set({
            ...currentData,
            title,
            description,
            promptText,
            category,
            imageUrl,
            additionalImages: additionalImages || [],
            updatedAt: new Date().toISOString(),
            updatedBy: decodedToken.uid,
            slug: newSlug,
          });
          
          // Delete old document
          await promptRef.delete();
          
          return Response.json({ 
            success: true, 
            message: 'Prompt updated successfully',
            promptId: newSlug,
            slug: newSlug
          });
        }
      }
      
      // Update existing document if slug hasn't changed
      await promptRef.update({
        title,
        description,
        promptText,
        category,
        imageUrl,
        additionalImages: additionalImages || [],
        updatedAt: new Date().toISOString(),
        updatedBy: decodedToken.uid,
        slug: newSlug,
      });

      return Response.json({ 
        success: true, 
        message: 'Prompt updated successfully',
        promptId: newSlug,
        slug: newSlug
      });
    }

    // Create new prompt
    const slug = await generateUniqueSlug(title, db);
    const promptRef = db.collection('prompts').doc(slug);
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
      slug,
    });

    return Response.json({ 
      success: true, 
      message: 'Prompt created successfully',
      promptId: slug,
      slug
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
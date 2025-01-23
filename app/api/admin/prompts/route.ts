import { NextResponse } from 'next/server'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { z } from 'zod'

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

// Validation schemas
const ImageMetadataSchema = z.object({
  url: z.string().url('Invalid image URL'),
  alt: z.string().optional(),
  title: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional()
});

const PromptSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must not exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must not exceed 500 characters'),
  promptText: z.string().min(10, 'Prompt text must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid main image URL'),
  imageMetadata: ImageMetadataSchema.optional(),
  additionalImages: z.array(ImageMetadataSchema).max(5, 'Maximum 5 additional images allowed').optional(),
  isPublic: z.boolean().default(true),
  price: z.number().min(0),
  status: z.enum(['active', 'draft', 'archived']).default('active')
});

export async function POST(request: Request) {
  try {
    // Get the authorization token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get user claims
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user exists and is admin
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || !userDoc.data()?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Parse and validate the request body
    const rawData = await request.json();
    console.log('Received data:', rawData);
    
    try {
      const validatedData = PromptSchema.parse(rawData);
      const { 
        id, 
        title, 
        description, 
        promptText, 
        category, 
        imageUrl,
        imageMetadata,
        additionalImages,
        isPublic,
        price,
        status 
      } = validatedData;

      // If id is provided, update existing prompt
      if (id) {
        const promptRef = db.collection('prompts').doc(id);
        const promptDoc = await promptRef.get();
        
        if (!promptDoc.exists) {
          return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
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
              imageMetadata,
              additionalImages,
              isPublic,
              price,
              status,
              updatedAt: new Date().toISOString(),
              updatedBy: decodedToken.uid,
              slug: newSlug,
            });
            
            // Delete old document
            await promptRef.delete();
            
            return NextResponse.json({ 
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
          imageMetadata,
          additionalImages,
          isPublic,
          price,
          status,
          updatedAt: new Date().toISOString(),
          updatedBy: decodedToken.uid,
          slug: newSlug,
        });

        return NextResponse.json({ 
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
        imageMetadata,
        additionalImages,
        isPublic,
        price,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: decodedToken.uid,
        views: 0,
        favorites: 0,
        featured: false,
        slug,
        version: 1,
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Prompt created successfully',
        promptId: slug,
        slug
      });

    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json({ 
        error: 'Validation error', 
        details: validationError instanceof Error ? validationError.message : 'Invalid data'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
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
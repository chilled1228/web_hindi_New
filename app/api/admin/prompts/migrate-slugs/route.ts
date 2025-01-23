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
async function generateUniqueSlug(title: string, db: FirebaseFirestore.Firestore, currentId?: string): Promise<string> {
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

  if (snapshot.empty || (snapshot.size === 1 && snapshot.docs[0].id === currentId)) {
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

    // Get all prompts
    const promptsSnapshot = await db.collection('prompts').get();
    const results = {
      total: promptsSnapshot.size,
      updated: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // Process each prompt
    for (const doc of promptsSnapshot.docs) {
      try {
        const data = doc.data();
        
        // Skip if already has a valid slug matching the title
        if (data.slug && data.slug === doc.id && data.slug === data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')) {
          results.skipped++;
          continue;
        }

        // Generate new slug
        const newSlug = await generateUniqueSlug(data.title, db, doc.id);
        
        if (newSlug === doc.id) {
          // Just update the slug field if document ID matches
          await doc.ref.update({ slug: newSlug });
          results.updated++;
        } else {
          // Create new document with new slug
          const newDoc = db.collection('prompts').doc(newSlug);
          await newDoc.set({
            ...data,
            slug: newSlug
          });
          
          // Delete old document
          await doc.ref.delete();
          results.updated++;
        }
      } catch (error: any) {
        results.errors.push(`Error processing prompt ${doc.id}: ${error.message}`);
      }
    }

    return Response.json({ 
      success: true,
      message: 'Migration completed',
      results
    });

  } catch (error) {
    console.error('Error during migration:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 
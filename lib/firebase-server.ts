import { db as adminDb } from './firebase-admin';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, getDoc, doc, DocumentData } from 'firebase/firestore';

// Firebase config using environment variables with fallbacks to hardcoded values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCZ1ANouWH3dvVXlqo4bSjtLMbaJigSEJE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hinidiblog.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hinidiblog",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "hinidiblog.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "773076236040",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:773076236040:web:9c33e47fc6349e2a245ebd",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-PXG47XZWF1"
};

// Define the BlogPost interface to match the expected structure
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  description?: string;
  publishedAt: string;
  updatedAt?: string;
  author: {
    name: string;
    image?: string;
    role?: string;
    avatar?: string;
    bio?: string;
  };
  categories: string[];
  tags: string[];
  slug: string;
  coverImage?: string;
  readingTime?: string;
  status?: string;
}

// Initialize Firebase client for fallback
const app = initializeApp(firebaseConfig, 'server-fallback');
const clientDb = getFirestore(app);

/**
 * Server-side data access with fallback to client-side Firebase
 * This provides a unified interface for server components to access data
 * It will try to use the Admin SDK first, and fall back to the client SDK if that fails
 */
export const serverDb = {
  /**
   * Get all blog posts with optional filtering
   */
  async getBlogPosts(options: {
    limit?: number;
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
    category?: string;
    tag?: string;
    status?: string;
  } = {}): Promise<BlogPost[]> {
    const {
      limit: limitCount = 100,
      orderByField = 'publishedAt',
      orderDirection = 'desc',
      category,
      tag,
      status = 'published'
    } = options;

    try {
      // Try using Admin SDK first
      console.log('[Server DB] Fetching blog posts with Admin SDK');
      let adminQuery: any = adminDb.collection('blog_posts');
      
      // Add filters
      if (status) {
        adminQuery = adminQuery.where('status', '==', status);
      }
      
      if (category) {
        adminQuery = adminQuery.where('categories', 'array-contains', category);
      }
      
      if (tag) {
        adminQuery = adminQuery.where('tags', 'array-contains', tag);
      }
      
      // Add ordering and limit
      adminQuery = adminQuery.orderBy(orderByField, orderDirection).limit(limitCount);
      
      const snapshot = await adminQuery.get();
      
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        publishedAt: doc.data().publishedAt?.toDate?.().toISOString() || null,
        categories: doc.data().categories || [],
        tags: doc.data().tags || [],
        excerpt: doc.data().excerpt || '',
        slug: doc.data().slug || doc.id
      })) as BlogPost[];
    } catch (error) {
      console.error('[Server DB] Error fetching with Admin SDK, falling back to client SDK:', error);
      
      // Fall back to client SDK
      try {
        console.log('[Server DB] Fetching blog posts with Client SDK');
        let clientQuery = collection(clientDb, 'blog_posts');
        
        // Build query with filters
        let constraints: any[] = [];
        
        if (status) {
          constraints.push(where('status', '==', status));
        }
        
        // Note: Client SDK can't combine array-contains filters, so we'll filter in memory if needed
        if (category) {
          constraints.push(where('categories', 'array-contains', category));
        }
        
        constraints.push(orderBy(orderByField, orderDirection));
        constraints.push(limit(limitCount));
        
        const q = query(clientQuery, ...constraints);
        const snapshot = await getDocs(q);
        
        let results = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            publishedAt: data.publishedAt?.toDate?.().toISOString() || null,
            categories: data.categories || [],
            tags: data.tags || [],
            excerpt: data.excerpt || '',
            slug: data.slug || doc.id
          };
        }) as BlogPost[];
        
        // Filter by tag in memory if needed (since we can't combine array-contains filters)
        if (tag) {
          results = results.filter(post => 
            post.tags && Array.isArray(post.tags) && post.tags.includes(tag)
          );
        }
        
        return results;
      } catch (fallbackError) {
        console.error('[Server DB] Both Admin and Client SDK failed:', fallbackError);
        return [];
      }
    }
  },
  
  /**
   * Get a single blog post by slug
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      // Try using Admin SDK first
      console.log('[Server DB] Fetching blog post by slug with Admin SDK');
      const snapshot = await adminDb.collection('blog_posts')
        .where('slug', '==', slug)
        .where('status', '==', 'published')
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.().toISOString() || null,
        categories: data.categories || [],
        tags: data.tags || [],
        excerpt: data.excerpt || '',
        slug: data.slug || doc.id
      } as BlogPost;
    } catch (error) {
      console.error('[Server DB] Error fetching with Admin SDK, falling back to client SDK:', error);
      
      // Fall back to client SDK
      try {
        console.log('[Server DB] Fetching blog post by slug with Client SDK');
        const q = query(
          collection(clientDb, 'blog_posts'),
          where('slug', '==', slug),
          where('status', '==', 'published'),
          limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          return null;
        }
        
        const doc = snapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          publishedAt: data.publishedAt?.toDate?.().toISOString() || null,
          categories: data.categories || [],
          tags: data.tags || [],
          excerpt: data.excerpt || '',
          slug: data.slug || doc.id
        } as BlogPost;
      } catch (fallbackError) {
        console.error('[Server DB] Both Admin and Client SDK failed:', fallbackError);
        return null;
      }
    }
  },
  
  /**
   * Get a single blog post by ID
   */
  async getBlogPostById(id: string): Promise<BlogPost | null> {
    try {
      // Try using Admin SDK first
      console.log('[Server DB] Fetching blog post by ID with Admin SDK');
      const docRef = adminDb.collection('blog_posts').doc(id);
      const snapshot = await docRef.get();
      
      if (!snapshot.exists) {
        return null;
      }
      
      const data = snapshot.data() || {};
      return {
        id: snapshot.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.().toISOString() || null,
        categories: data.categories || [],
        tags: data.tags || [],
        excerpt: data.excerpt || '',
        slug: data.slug || snapshot.id
      } as BlogPost;
    } catch (error) {
      console.error('[Server DB] Error fetching with Admin SDK, falling back to client SDK:', error);
      
      // Fall back to client SDK
      try {
        console.log('[Server DB] Fetching blog post by ID with Client SDK');
        const docRef = doc(clientDb, 'blog_posts', id);
        const snapshot = await getDoc(docRef);
        
        if (!snapshot.exists()) {
          return null;
        }
        
        const data = snapshot.data() || {};
        return {
          id: snapshot.id,
          ...data,
          publishedAt: data.publishedAt?.toDate?.().toISOString() || null,
          categories: data.categories || [],
          tags: data.tags || [],
          excerpt: data.excerpt || '',
          slug: data.slug || snapshot.id
        } as BlogPost;
      } catch (fallbackError) {
        console.error('[Server DB] Both Admin and Client SDK failed:', fallbackError);
        return null;
      }
    }
  }
};
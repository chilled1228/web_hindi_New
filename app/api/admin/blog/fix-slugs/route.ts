import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Get all blog posts
    const postsRef = await db.collection('blog_posts').get();
    const slugMap = new Map<string, string[]>();
    
    // First pass: collect all slugs and their document IDs
    postsRef.docs.forEach(doc => {
      const data = doc.data();
      const slug = data.slug || '';
      if (slug) {
        if (!slugMap.has(slug)) {
          slugMap.set(slug, []);
        }
        slugMap.get(slug)?.push(doc.id);
      }
    });

    // Find and fix duplicates
    const updates: Promise<any>[] = [];
    let fixCount = 0;

    Array.from(slugMap.entries()).forEach(([slug, docIds]) => {
      if (docIds.length > 1) {
        // Keep the first occurrence as is, update others
        for (let i = 1; i < docIds.length; i++) {
          const newSlug = `${slug}-${i}`;
          updates.push(
            db.collection('blog_posts').doc(docIds[i]).update({
              slug: newSlug
            })
          );
          fixCount++;
        }
      }
    });

    // Apply all updates
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixCount} duplicate slugs`,
      duplicates: Object.fromEntries(
        Array.from(slugMap.entries())
          .filter(([_, ids]) => ids.length > 1)
      )
    });
  } catch (error) {
    console.error('Error fixing slugs:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
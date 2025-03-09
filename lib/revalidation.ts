/**
 * Utility functions for revalidating content on the website
 */

// Keep track of ongoing revalidation requests
let revalidationInProgress = false;

/**
 * Triggers revalidation for the entire site or specific pages
 * @param options Optional parameters for revalidation
 * @returns Promise<boolean> indicating success or failure
 */
export async function triggerRevalidation(options?: {
  path?: string;
  slug?: string;
}): Promise<boolean> {
  // Prevent multiple simultaneous revalidation requests
  if (revalidationInProgress) {
    console.log('Revalidation already in progress, skipping...');
    return false;
  }

  try {
    revalidationInProgress = true;
    const revalidationToken = process.env.NEXT_PUBLIC_REVALIDATION_TOKEN;
    
    if (!revalidationToken) {
      console.error('Revalidation token is missing in environment variables');
      return false;
    }
    
    const revalidateResponse = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      },
      body: JSON.stringify({
        token: revalidationToken,
        ...(options?.path ? { path: options.path } : {}),
        ...(options?.slug ? { slug: options.slug } : {})
      }),
      credentials: 'same-origin'
    });
    
    if (!revalidateResponse.ok) {
      const errorText = await revalidateResponse.text();
      console.error('Failed to revalidate site content:', errorText);
      return false;
    }

    const result = await revalidateResponse.json();
    return result.revalidated === true;
  } catch (error) {
    console.error('Error during revalidation:', error);
    return false;
  } finally {
    // Reset the flag after a delay to prevent rapid subsequent calls
    setTimeout(() => {
      revalidationInProgress = false;
    }, 5000);
  }
}

/**
 * Triggers revalidation for a specific blog post
 * @param slug The slug of the blog post to revalidate
 * @returns Promise<boolean> indicating success or failure
 */
export async function revalidateBlogPost(slug: string): Promise<boolean> {
  return triggerRevalidation({ slug });
}

/**
 * Triggers revalidation for all blog posts
 * @returns Promise<boolean> indicating success or failure
 */
export async function revalidateAllBlogPosts(): Promise<boolean> {
  return triggerRevalidation({ path: '/blog' });
}

/**
 * Triggers revalidation for the homepage
 * @returns Promise<boolean> indicating success or failure
 */
export async function revalidateHomepage(): Promise<boolean> {
  return triggerRevalidation({ path: '/' });
}

/**
 * Triggers revalidation for the entire site
 * @returns Promise<boolean> indicating success or failure
 */
export async function revalidateEntireSite(): Promise<boolean> {
  return triggerRevalidation();
} 
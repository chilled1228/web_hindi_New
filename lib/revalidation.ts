/**
 * Utility functions for revalidating content on the website
 */

/**
 * Triggers revalidation for the entire site or specific pages
 * @param options Optional parameters for revalidation
 * @returns Promise<boolean> indicating success or failure
 */
export async function triggerRevalidation(options?: {
  path?: string;
  slug?: string;
}): Promise<boolean> {
  try {
    const revalidationToken = process.env.NEXT_PUBLIC_REVALIDATION_TOKEN;
    const revalidateResponse = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: revalidationToken,
        ...(options?.path ? { path: options.path } : {}),
        ...(options?.slug ? { slug: options.slug } : {})
      }),
    });
    
    if (revalidateResponse.ok) {
      console.log('Successfully revalidated site content');
      return true;
    } else {
      console.error('Failed to revalidate site content:', await revalidateResponse.text());
      return false;
    }
  } catch (error) {
    console.error('Error revalidating site content:', error);
    return false;
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
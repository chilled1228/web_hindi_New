import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { path, token, slug } = requestData;

    // Check if the token is valid - use NEXT_PUBLIC_REVALIDATION_TOKEN to match client
    const validToken = process.env.NEXT_PUBLIC_REVALIDATION_TOKEN;
    
    if (!validToken) {
      console.error('NEXT_PUBLIC_REVALIDATION_TOKEN is not set');
      return NextResponse.json(
        { revalidated: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (token !== validToken) {
      console.error('Invalid revalidation token');
      return NextResponse.json(
        { revalidated: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Revalidate based on what was provided
    if (slug) {
      // For blog posts, only revalidate the specific post and blog index
      revalidatePath(`/blog/${slug}`);
      revalidatePath('/blog');
      console.log(`Revalidated blog post: ${slug} and blog index`);
    } else if (path) {
      // For other paths, only revalidate the specific path
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }

    return NextResponse.json({
      revalidated: true,
      message: 'Revalidation successful'
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { revalidated: false, message: 'Error revalidating', error: String(error) },
      { status: 500 }
    );
  }
}

// Remove GET endpoint as it's not needed and could cause issues 
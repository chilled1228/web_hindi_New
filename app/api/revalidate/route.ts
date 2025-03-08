import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Get the secret token from the request
    const requestData = await request.json();
    const { path, token, slug } = requestData;

    // Check if the token is valid
    if (token !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    if (path) {
      // Revalidate the specific path
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }

    if (slug) {
      // Revalidate the specific blog post
      revalidatePath(`/blog/${slug}`);
      revalidateTag('blog-post');
      console.log(`Revalidated blog post: ${slug}`);
    }

    // Always revalidate the blog index and homepage
    revalidatePath('/blog');
    revalidatePath('/');
    revalidateTag('blogs');
    console.log('Revalidated blog index and homepage');

    return NextResponse.json({
      revalidated: true,
      message: 'Revalidation successful'
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the secret token from the URL
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const path = searchParams.get('path');
    const slug = searchParams.get('slug');

    // Check if the token is valid
    if (token !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    if (path) {
      // Revalidate the specific path
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }

    if (slug) {
      // Revalidate the specific blog post
      revalidatePath(`/blog/${slug}`);
      revalidateTag('blog-post');
      console.log(`Revalidated blog post: ${slug}`);
    }

    // Always revalidate the blog index and homepage
    revalidatePath('/blog');
    revalidatePath('/');
    revalidateTag('blogs');
    console.log('Revalidated blog index and homepage');

    return NextResponse.json({
      revalidated: true,
      message: 'Revalidation successful'
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: String(error) },
      { status: 500 }
    );
  }
} 
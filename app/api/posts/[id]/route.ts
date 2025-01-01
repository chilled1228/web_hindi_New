import { NextResponse } from 'next/server'

// Dummy data for posts
const posts = [
  {
    id: '1',
    title: 'Welcome to Our Blog',
    slug: 'welcome-to-our-blog',
    excerpt: 'This is our first blog post. We\'re excited to share our journey with you.',
    content: '<h2>Welcome to Our Blog!</h2><p>This is our first blog post. We\'re excited to share our journey with you.</p><p>Stay tuned for more content!</p>',
    category: 'Announcements',
    published: true,
    createdAt: new Date().toISOString(),
    author: {
      name: 'Test User',
      email: 'test@example.com'
    }
  }
]

// GET /api/posts/[id] - Get a single post
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = posts.find(post => post.id === params.id)

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

// PATCH /api/posts/[id] - Update a post
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const postIndex = posts.findIndex(post => post.id === params.id)
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    posts[postIndex] = { ...posts[postIndex], ...json }

    return NextResponse.json(posts[postIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postIndex = posts.findIndex(post => post.id === params.id)
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    posts.splice(postIndex, 1)

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
} 
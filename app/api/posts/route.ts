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

// GET /api/posts - Get all posts
export async function GET() {
  try {
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create a new post
export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { title, slug, excerpt, content, category, published } = json

    const newPost = {
      id: String(posts.length + 1),
      title,
      slug,
      excerpt,
      content,
      category,
      published: published || false,
      createdAt: new Date().toISOString(),
      author: {
        name: 'Test User',
        email: 'test@example.com'
      }
    }
    posts.push(newPost)

    return NextResponse.json(newPost)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
} 
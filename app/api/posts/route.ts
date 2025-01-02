import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/posts - Get all posts
export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

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
    const { title, content, excerpt, category, published = false } = json

    const { data: post, error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          content,
          excerpt,
          category,
          published,
          author_id: (await supabase.auth.getUser()).data.user?.id
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
} 
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false
    }
  }
)

export async function GET(request: Request) {
  try {
    // Check authentication using Clerk
    const session = await auth()
    if (!session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to view your history' },
        { status: 401 }
      )
    }

    // Parse pagination parameters from URL
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Fetch prompt history from Supabase with pagination
    const { data: history, error, count } = await supabase
      .from('prompt_history')
      .select('id, created_at, prompt_type, output_text, input_image', { count: 'exact' })
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching prompt history:', error)
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to fetch prompt history' },
        { status: 500 }
      )
    }

    // Process the history to limit image size
    const processedHistory = history?.map(item => ({
      ...item,
      // Only return a thumbnail version of the image or null
      input_image: item.input_image ? item.input_image.slice(0, 200000) : null // Limit to ~200KB
    }))

    return NextResponse.json({ 
      history: processedHistory,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Error in prompt history endpoint:', error)
    return NextResponse.json(
      { error: 'Server error', message: error.message || 'Failed to fetch prompt history' },
      { status: 500 }
    )
  }
} 
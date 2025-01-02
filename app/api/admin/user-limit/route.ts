import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// PATCH /api/admin/user-limit - Update a user's daily prompt limit
export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if user is authenticated and is an admin
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const { userId, newLimit } = await request.json()
    
    if (!userId || typeof newLimit !== 'number' || newLimit < 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Update user's daily prompt limit
    const { error: updateError } = await supabase
      .from('users')
      .update({ daily_prompt_limit: newLimit })
      .eq('id', userId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user limit:', error)
    return NextResponse.json(
      { error: 'Failed to update user limit' },
      { status: 500 }
    )
  }
} 
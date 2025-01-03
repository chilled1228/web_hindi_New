import { createClient } from '@supabase/supabase-js'
import { getAuth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

// Create a single supabase client for interacting with your database
export async function getSupabaseClient(req: NextRequest) {
  const auth = getAuth(req)
  const supabaseAccessToken = await auth.getToken({ template: 'supabase' })

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`
        }
      }
    }
  )
} 
import { createClient } from '@supabase/supabase-js'
import { getAuth } from '@clerk/nextjs/server'

// Create a single supabase client for interacting with your database
export async function getSupabaseClient() {
  const auth = getAuth()
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
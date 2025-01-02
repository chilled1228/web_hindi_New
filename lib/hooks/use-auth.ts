import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { User } from '@supabase/supabase-js'

interface UserData {
  id: string
  email: string
  daily_prompt_limit: number
}

interface AuthState {
  user: User | null
  userData: UserData | null
  loading: boolean
  promptsRemaining: number | null
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    userData: null,
    loading: true,
    promptsRemaining: null,
    error: null,
  })

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(s => ({ ...s, user: session?.user ?? null, loading: false }))
      if (session?.user) {
        fetchUserData(session.user.id)
      }
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setState(s => ({ ...s, user: session?.user ?? null, loading: false }))
      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setState(s => ({ ...s, userData: null, promptsRemaining: null }))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Get start of today for daily usage
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { count: usedPrompts, error: usageError } = await supabase
        .from('prompt_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('used_at', startOfDay.toISOString())

      if (usageError) throw usageError

      const promptsRemaining = userData.daily_prompt_limit - (usedPrompts || 0)

      setState(s => ({
        ...s,
        userData,
        promptsRemaining,
        error: null
      }))
    } catch (error) {
      setState(s => ({
        ...s,
        error: 'Failed to fetch user data'
      }))
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setState(s => ({
        ...s,
        user: null,
        userData: null,
        promptsRemaining: null
      }))
    } catch (error) {
      throw error
    }
  }

  const trackPromptUsage = async (promptType: string) => {
    if (!state.user) throw new Error('User not authenticated')
    if (state.promptsRemaining !== null && state.promptsRemaining <= 0) {
      throw new Error('Daily prompt limit reached')
    }

    try {
      const { error } = await supabase
        .from('prompt_usage')
        .insert([
          {
            user_id: state.user.id,
            prompt_type: promptType
          }
        ])

      if (error) throw error

      // Update prompts remaining
      setState(s => ({
        ...s,
        promptsRemaining: s.promptsRemaining !== null ? s.promptsRemaining - 1 : null
      }))

      // Refresh user data
      await fetchUserData(state.user.id)
    } catch (error) {
      throw error
    }
  }

  return {
    user: state.user,
    userData: state.userData,
    loading: state.loading,
    promptsRemaining: state.promptsRemaining,
    error: state.error,
    signUp,
    signIn,
    signOut,
    trackPromptUsage,
    fetchUserData
  }
} 
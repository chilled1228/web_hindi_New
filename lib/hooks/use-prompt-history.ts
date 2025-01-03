import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { User } from '@supabase/supabase-js'

interface PromptHistory {
  id: string
  created_at: string
  prompt_type: string
  input_image: string
  output_text: string
}

interface PromptHistoryState {
  history: PromptHistory[]
  loading: boolean
  error: string | null
}

export function usePromptHistory(user: User | null) {
  const [state, setState] = useState<PromptHistoryState>({
    history: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (user) {
      fetchHistory()
    } else {
      setState(s => ({ ...s, history: [], loading: false }))
    }
  }, [user])

  const fetchHistory = async () => {
    try {
      setState(s => ({ ...s, loading: true, error: null }))
      
      const { data, error } = await supabase
        .from('prompt_history')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setState(s => ({
        ...s,
        history: data,
        loading: false,
        error: null
      }))
    } catch (error) {
      setState(s => ({
        ...s,
        loading: false,
        error: 'Failed to fetch prompt history'
      }))
    }
  }

  return {
    history: state.history,
    loading: state.loading,
    error: state.error,
    refetch: fetchHistory
  }
} 
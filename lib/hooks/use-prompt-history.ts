import { useState, useEffect } from 'react'
import { UserResource } from '@clerk/types'

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

export function usePromptHistory(user: UserResource | null | undefined) {
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
      // Mock implementation - replace with actual API call
      setState(s => ({
        ...s,
        history: [],
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
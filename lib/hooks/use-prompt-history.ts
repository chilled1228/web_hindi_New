import { useState, useEffect, useCallback } from 'react'
import { UserResource } from '@clerk/types'

interface PromptHistory {
  id: string
  created_at: string
  prompt_type: string
  input_image: string
  output_text: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface PromptHistoryState {
  history: PromptHistory[]
  loading: boolean
  error: string | null
  pagination: Pagination | null
}

interface PromptHistoryResponse {
  history: PromptHistory[]
  pagination: Pagination
}

export function usePromptHistory(user: UserResource | null | undefined) {
  const [state, setState] = useState<PromptHistoryState>({
    history: [],
    loading: true,
    error: null,
    pagination: null
  })

  // Cache for prefetched pages
  const [pageCache, setPageCache] = useState<Record<number, PromptHistory[]>>({})

  const fetchPage = useCallback(async (page: number, isPrefetch = false) => {
    if (!user) return
    
    // If the page is in cache and it's not a prefetch, use it
    if (pageCache[page] && !isPrefetch) {
      setState(s => ({
        ...s,
        history: pageCache[page],
        loading: false,
        error: null
      }))
      return
    }

    try {
      if (!isPrefetch) {
        setState(s => ({ ...s, loading: true, error: null }))
      }
      
      const response = await fetch(`/api/prompt-history?page=${page}&limit=10`)
      const data: PromptHistoryResponse = await response.json()

      if (!response.ok) {
        throw new Error('Failed to fetch prompt history')
      }

      // Update cache
      setPageCache(cache => ({
        ...cache,
        [page]: data.history
      }))

      if (!isPrefetch) {
        setState(s => ({
          ...s,
          history: data.history,
          pagination: data.pagination,
          loading: false,
          error: null
        }))
      }
    } catch (error) {
      if (!isPrefetch) {
        setState(s => ({
          ...s,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch prompt history'
        }))
      }
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchPage(1)
    } else {
      setState(s => ({ 
        ...s, 
        history: [], 
        loading: false,
        pagination: null 
      }))
    }
  }, [user, fetchPage])

  return {
    history: state.history,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    fetchPage
  }
} 
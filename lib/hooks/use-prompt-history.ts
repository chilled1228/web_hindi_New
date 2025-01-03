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

  // Improved cache with TTL
  const [pageCache, setPageCache] = useState<Record<number, { data: PromptHistory[], timestamp: number }>>({})
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const isPageCacheValid = useCallback((page: number) => {
    const cached = pageCache[page];
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_TTL;
  }, [pageCache]);

  const fetchPage = useCallback(async (page: number, isPrefetch = false) => {
    if (!user) return;
    
    // Check cache first
    if (!isPrefetch && isPageCacheValid(page)) {
      setState(s => ({
        ...s,
        history: pageCache[page].data,
        loading: false,
        error: null
      }));
      return;
    }

    try {
      if (!isPrefetch) {
        setState(s => ({ ...s, loading: true, error: null }));
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`/api/prompt-history?page=${page}&limit=10`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data: PromptHistoryResponse = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch prompt history');
      }

      // Update cache with timestamp
      setPageCache(cache => ({
        ...cache,
        [page]: {
          data: data.history,
          timestamp: Date.now()
        }
      }));

      if (!isPrefetch) {
        setState(s => ({
          ...s,
          history: data.history,
          pagination: data.pagination,
          loading: false,
          error: null
        }));
      }
    } catch (error) {
      if (!isPrefetch) {
        setState(s => ({
          ...s,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch prompt history'
        }));
      }
    }
  }, [user, isPageCacheValid]);

  // Prefetch next and previous pages
  useEffect(() => {
    if (!state.pagination) return;

    const prefetchTimer = setTimeout(() => {
      const pagination = state.pagination;
      if (!pagination) return;

      // Prefetch next page if available
      if (pagination.page < pagination.totalPages && !isPageCacheValid(pagination.page + 1)) {
        fetchPage(pagination.page + 1, true);
      }
      
      // Prefetch previous page if available
      if (pagination.page > 1 && !isPageCacheValid(pagination.page - 1)) {
        fetchPage(pagination.page - 1, true);
      }
    }, 1000);

    return () => clearTimeout(prefetchTimer);
  }, [state.pagination, fetchPage, isPageCacheValid]);

  useEffect(() => {
    if (user) {
      fetchPage(1);
    } else {
      setState(s => ({ 
        ...s, 
        history: [], 
        loading: false,
        pagination: null 
      }));
    }
  }, [user, fetchPage]);

  return {
    history: state.history,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    fetchPage
  };
} 
import { useState, useCallback, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, getDocs, startAfter, addDoc, Timestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export interface PromptHistoryItem {
  id?: string
  userId: string
  promptType: string
  inputImage?: string
  outputText: string
  createdAt: Date
}

const LOCAL_STORAGE_KEY = 'promptHistory';

export function usePromptHistory() {
  const [history, setHistory] = useState<PromptHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<any>(null)

  // Load history from local storage on initial load
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error('Error loading history from local storage', e);
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Error saving history to local storage', e);
    }
  }, [history]);

  const fetchHistory = useCallback(async (lastDocument?: any) => {
    try {
      const user = auth.currentUser
      if (!user) {
        console.log('No user logged in')
        throw new Error('Please sign in to view your prompt history')
      }

      console.log('Fetching history for user:', user.uid)
      
      let q = query(
        collection(db, 'prompt_history'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      )

      if (lastDocument) {
        q = query(q, startAfter(lastDocument))
      }

      const querySnapshot = await getDocs(q)
      console.log('Fetched documents:', querySnapshot.size)

      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as PromptHistoryItem[]

      return {
        items,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === 10
      }
    } catch (error) {
      console.error('Error fetching history:', error)
      throw error
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return

    try {
      setLoading(true)
      setError(null)

      const data = await fetchHistory(lastDoc)
      
      setHistory(prev => [...prev, ...data.items])
      setLastDoc(data.lastDoc)
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('Error loading more:', error)
      setError(error instanceof Error ? error.message : 'Failed to load more history')
    } finally {
      setLoading(false)
    }
  }, [fetchHistory, hasMore, lastDoc, loading])

  const savePrompt = useCallback(async (data: {
    promptType: string
    inputImage?: string
    outputText: string
  }) => {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('Please sign in to save prompts')
      }

      console.log('Saving prompt for user:', user.uid)

      const docRef = await addDoc(collection(db, 'prompt_history'), {
        ...data,
        userId: user.uid,
        createdAt: Timestamp.now()
      })

      const newPrompt = {
        id: docRef.id,
        ...data,
        userId: user.uid,
        createdAt: new Date()
      }

      setHistory(prev => [newPrompt, ...prev])
      console.log('Prompt saved successfully')
      
      return newPrompt
    } catch (error) {
      console.error('Error saving prompt:', error)
      throw error
    }
  }, [])

  useEffect(() => {
    const initialFetch = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchHistory()
        setHistory(data.items)
        setLastDoc(data.lastDoc)
        setHasMore(data.hasMore)
      } catch (error) {
        console.error('Error in initial fetch:', error)
        setError(error instanceof Error ? error.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    initialFetch()
  }, [fetchHistory])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          setLoading(true)
          setError(null)
          console.log('Loading initial history for user:', user.uid)
          
          const data = await fetchHistory()
          
          setHistory(data.items)
          setLastDoc(data.lastDoc)
          setHasMore(data.hasMore)
        } catch (error) {
          console.error('Error loading initial history:', error)
          setError(error instanceof Error ? error.message : 'Failed to load prompt history')
        } finally {
          setLoading(false)
        }
      } else {
        // Clear local storage on logout
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setHistory([]);
      }
    });

    return () => unsubscribe();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    hasMore,
    loadMore,
    savePrompt,
  }
} 
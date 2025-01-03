import { usePromptHistory } from '@/lib/hooks/use-prompt-history'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from './ui/button'
import { useEffect, useRef, useCallback } from 'react'

export function PromptHistory() {
  const { history, loading, error, hasMore, loadMore } = usePromptHistory()
  const observerRef = useRef<IntersectionObserver>()
  const lastItemRef = useRef<HTMLDivElement>(null)

  const lastItemCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return

      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      })

      if (node) {
        observerRef.current.observe(node)
      }
    },
    [loading, hasMore, loadMore]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  if (loading && !history.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg">
        {error}
      </div>
    )
  }

  if (!history.length) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No prompt history yet. Generate some prompts to see them here.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {history.map((item, index) => (
          <div
            key={item.id}
            ref={index === history.length - 1 ? lastItemCallback : null}
            className="p-4 rounded-lg border bg-card text-card-foreground"
          >
            <div className="flex items-start gap-4">
              {item.inputImage && (
                <div className="relative w-24 h-24 rounded-md overflow-hidden">
                  <Image
                    src={item.inputImage}
                    alt="Input image"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <div className="text-sm text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm font-medium">{item.promptType}</div>
                <div className="text-sm">{item.outputText}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
    </div>
  )
} 
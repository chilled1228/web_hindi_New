import { useAuth } from '@/lib/hooks/use-auth'
import { usePromptHistory } from '@/lib/hooks/use-prompt-history'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Button } from './ui/button'
import { useCallback, useEffect } from 'react'

export function PromptHistory() {
  const { user } = useAuth()
  const { history, loading, error, pagination, fetchPage } = usePromptHistory(user)

  const handlePrevPage = useCallback(() => {
    if (pagination && pagination.page > 1) {
      fetchPage(pagination.page - 1)
    }
  }, [pagination, fetchPage])

  const handleNextPage = useCallback(() => {
    if (pagination && pagination.page < pagination.totalPages) {
      fetchPage(pagination.page + 1)
    }
  }, [pagination, fetchPage])

  // Prefetch next page
  useEffect(() => {
    if (pagination && pagination.page < pagination.totalPages) {
      const prefetchTimer = setTimeout(() => {
        fetchPage(pagination.page + 1, true)
      }, 1000)
      return () => clearTimeout(prefetchTimer)
    }
  }, [pagination, fetchPage])

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
    <div className="space-y-6">
      <div className="space-y-6">
        {history.map((item) => (
          <div key={item.id} className="bg-accent rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium capitalize">{item.prompt_type}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
            
            {item.input_image && (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={`data:image/jpeg;base64,${item.input_image}`}
                  alt="Input image"
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            )}
            
            <div className="p-4 bg-background rounded-lg border border-border">
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {item.output_text}
              </p>
            </div>
            
            <button
              onClick={() => navigator.clipboard.writeText(item.output_text)}
              className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 py-1 px-2 rounded hover:bg-primary/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copy
            </button>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={pagination.page === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={pagination.page === pagination.totalPages || loading}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
} 
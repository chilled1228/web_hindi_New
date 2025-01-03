import { useAuth } from '@/lib/hooks/use-auth'
import { usePromptHistory } from '@/lib/hooks/use-prompt-history'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export function PromptHistory() {
  const { user } = useAuth()
  const { history, loading, error } = usePromptHistory(user)

  if (loading) {
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
  )
} 
import { Metadata } from 'next'
import { defaultMetadata } from './metadata'
import { Suspense } from "react"
import { Loader2 } from 'lucide-react'
import { PromptGrid } from '@/components/prompt-grid'

// Generate metadata for SEO
export const metadata: Metadata = defaultMetadata

export default async function HomePage() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Minimal Hero */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-medium">AI Prompts</h1>
        <p className="text-sm text-muted-foreground">Curated collection of prompts</p>
      </div>

      {/* Prompts Grid */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }>
        <PromptGrid />
      </Suspense>
    </div>
  )
}


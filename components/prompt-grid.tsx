'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import NextImage from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Prompt {
  id: string
  title: string
  description: string
  category: string
  imageUrl: string
  createdAt: string
  slug: string
}

function PromptCardSkeleton() {
  return (
    <Card className="overflow-hidden transition-all duration-300 bg-background/60 dark:bg-gray-800/40 backdrop-blur-xl border-primary/10 dark:border-white/5">
      <div className="aspect-square relative bg-gradient-to-br from-background/80 to-muted/50 dark:from-gray-900/80 dark:to-gray-800/50 overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-muted/50" />
      </div>
      <div className="p-6 space-y-3">
        <div className="w-20 h-6 rounded-full bg-muted/50 animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-muted/50 rounded animate-pulse" />
          <div className="h-4 w-full bg-muted/50 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-muted/50 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  )
}

export function PromptGrid() {
  const [searchQuery, setSearchQuery] = useState('')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        // Fetch all prompts
        const promptsQuery = query(
          collection(db, 'prompts'),
          orderBy('createdAt', 'desc')
        )
        const promptsSnapshot = await getDocs(promptsQuery)
        const promptsData = promptsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Prompt[]
        setPrompts(promptsData)
      } catch (error) {
        console.error('Error fetching prompts:', error)
        setError('Failed to load prompts')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrompts()
  }, [])

  const filteredPrompts = prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12 px-4">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50"></div>
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors group-hover:text-primary" />
          <Input
            type="text"
            placeholder="Search prompts..."
            className="pl-12 h-14 bg-background/60 backdrop-blur-xl border-primary/10 hover:border-primary/30 focus:border-primary/50 text-base rounded-xl shadow-lg transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* All Prompts */}
      <section className="px-4">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">All Prompts</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {isLoading ? (
            <>
              {Array.from({ length: 8 }).map((_, index) => (
                <PromptCardSkeleton key={index} />
              ))}
            </>
          ) : filteredPrompts.length > 0 ? (
            filteredPrompts.map((prompt) => (
              <Link
                key={prompt.slug}
                href={`/prompts/${prompt.slug}`}
                className="group"
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl dark:shadow-primary/5 hover:-translate-y-1 bg-background/60 dark:bg-gray-800/40 backdrop-blur-xl border-primary/10 dark:border-white/5">
                  <div className="aspect-square relative bg-gradient-to-br from-background/80 to-muted/50 dark:from-gray-900/80 dark:to-gray-800/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <NextImage
                      src={prompt.imageUrl}
                      alt={prompt.title}
                      fill
                      className="transition-all duration-500 group-hover:scale-110"
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </div>
                  <div className="p-6">
                    <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground hover:bg-primary/20 transition-colors duration-300">
                      {prompt.category}
                    </Badge>
                    <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      {prompt.title}
                    </h3>
                    <p className="text-sm text-muted-foreground/80 line-clamp-2">
                      {prompt.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-background/60 backdrop-blur-xl rounded-xl border border-primary/10">
              <p className="text-muted-foreground text-lg">No prompts found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
} 
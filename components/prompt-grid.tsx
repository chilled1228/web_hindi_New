'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import NextImage from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { useEffect } from 'react'

interface Prompt {
  id: string
  title: string
  description: string
  category: string
  imageUrl: string
  createdAt: string
}

export function PromptGrid() {
  const [searchQuery, setSearchQuery] = useState('')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [featuredPrompts, setFeaturedPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        // Fetch featured prompts
        const featuredQuery = query(
          collection(db, 'prompts'),
          where('featured', '==', true),
          limit(3)
        )
        const featuredSnapshot = await getDocs(featuredQuery)
        const featuredData = featuredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Prompt[]
        setFeaturedPrompts(featuredData)

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
      <div className="max-w-2xl mx-auto mb-8 px-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Search prompts..."
            className="pl-12 h-12 bg-background/80 border-primary/20 hover:border-primary/40 text-base rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Featured Prompts */}
      {featuredPrompts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Prompts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPrompts.map((prompt) => (
              <Link
                key={prompt.id}
                href={`/prompts/${prompt.id}`}
                className="group"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
                  <div className="aspect-[16/9] relative bg-gradient-to-br from-pink-100 to-orange-100 p-4">
                    <NextImage
                      src={prompt.imageUrl}
                      alt={prompt.title}
                      fill
                      style={{ objectFit: "contain" }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      priority
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  </div>
                  <div className="p-4">
                    <Badge variant="secondary" className="mb-2">
                      {prompt.category}
                    </Badge>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {prompt.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {prompt.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Prompts */}
      <section>
        <h2 className="text-2xl font-bold mb-6">All Prompts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrompts.map((prompt) => (
            <Link
              key={prompt.id}
              href={`/prompts/${prompt.id}`}
              className="group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
                <div className="aspect-square relative bg-gradient-to-br from-pink-100 to-orange-100 p-4">
                  <NextImage
                    src={prompt.imageUrl}
                    alt={prompt.title}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    unoptimized={process.env.NODE_ENV === 'development'}
                  />
                </div>
                <div className="p-4">
                  <Badge variant="secondary" className="mb-2">
                    {prompt.category}
                  </Badge>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {prompt.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {prompt.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No prompts found matching your search.</p>
          </div>
        )}
      </section>
    </>
  )
} 
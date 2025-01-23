import { Metadata } from 'next'
import { defaultMetadata } from './metadata'
import { ContentSection } from "../components/content-section"
import dynamic from 'next/dynamic'
import { Suspense } from "react"
import { Search, Image, Wand2, BookOpen, Sparkles } from 'lucide-react'
import { Input } from "../components/ui/input"
import Link from 'next/link'
import NextImage from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { PromptGrid } from '@/components/prompt-grid'

// Generate metadata for SEO
export const metadata: Metadata = defaultMetadata

// Tool categories
const tools = [
  {
    category: "Image Tools",
    icon: Image,
    description: "Transform and analyze images with AI",
    items: [
      {
        id: "image-to-prompt",
        title: "Image to Prompt",
        description: "Generate creative prompts from your images",
        icon: Wand2,
        component: dynamic(() => import('../components/image-upload-section').then(mod => ({ default: mod.ImageUploadSection })))
      }
    ]
  },
  {
    category: "Text Tools",
    icon: BookOpen,
    description: "Advanced text processing and generation",
    items: [
      {
        id: "text-humanizer",
        title: "Text Humanizer",
        description: "Make your text sound more natural",
        icon: Sparkles,
        component: dynamic(() => import('../components/text-humanizer-section').then(mod => ({ default: mod.TextHumanizerSection })))
      },
      {
        id: "backstory",
        title: "Backstory Generator",
        description: "Create compelling character backstories",
        icon: BookOpen,
        component: dynamic(() => import('../components/backstory-generator-section').then(mod => ({ default: mod.BackstoryGeneratorSection })))
      }
    ]
  }
]

interface Prompt {
  id: string
  title: string
  description: string
  category: string
  imageUrl: string
  createdAt: string
}

export default async function HomePage() {
  return (
    <div className="relative w-full">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50"></div>
      
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            Free AI Prompts
          </span>
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-[600px] mx-auto">
          Discover and use high-quality AI prompts for your projects
        </p>
      </div>

      {/* Search and Prompts Grid */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }>
        <PromptGrid />
      </Suspense>
    </div>
  )
}


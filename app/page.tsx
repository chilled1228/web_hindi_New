'use client'
import { TabNavigation } from "../components/tab-navigation"
import { ContentSection } from "../components/content-section"
import dynamic from 'next/dynamic'
import { useState, Suspense } from "react"
import { Loader2, Search, Image, Wand2, BookOpen, Sparkles } from 'lucide-react'
import { Input } from "../components/ui/input"

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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const filteredTools = tools.map(category => ({
    ...category,
    items: category.items.filter(tool => 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0)

  const selectedToolData = tools
    .flatMap(category => category.items)
    .find(tool => tool.id === selectedTool)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50"></div>
      
      <div className="relative w-full min-h-screen">
        <main className="relative max-w-[1400px] mx-auto px-4 pt-8 pb-6">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Free Prompt Base
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-[600px] mx-auto">
              Your creative AI toolkit for generating prompts, humanizing text, and crafting stories
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 px-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search AI tools..."
                className="pl-12 h-12 bg-background/80 border-primary/20 hover:border-primary/40 text-base rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {selectedTool ? (
            <div className="space-y-4 px-4">
              <button
                onClick={() => setSelectedTool(null)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 rounded-lg border border-primary/20"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to tools
              </button>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              }>
                {selectedToolData && <selectedToolData.component />}
              </Suspense>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredTools.map((category) => (
                <div key={category.category} className="relative px-4">
                  <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 mb-4 shadow-sm border">
                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-background/50">
                        <category.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          {category.category}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {category.items.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        className="group aspect-square flex flex-col border backdrop-blur-sm bg-background/50 hover:bg-background/60 shadow-sm transition-all overflow-hidden rounded-xl"
                      >
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                          <div className="w-12 h-12 bg-background/50 flex items-center justify-center mb-4 rounded-xl">
                            <tool.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-medium text-base mb-2">{tool.title}</h3>
                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <ContentSection />
        </main>
      </div>
    </div>
  )
}


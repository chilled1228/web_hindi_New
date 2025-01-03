'use client'
import { TabNavigation } from "../components/tab-navigation"
import { ContentSection } from "../components/content-section"
import dynamic from 'next/dynamic'
import { useState, Suspense } from "react"
import { Loader2 } from 'lucide-react'

// Lazy load the ImageUploadSection component
const ImageUploadSection = dynamic(
  () => import('../components/image-upload-section').then(mod => ({ default: mod.ImageUploadSection })),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    ),
    ssr: false
  }
)

export default function Home() {
  const [activeTab, setActiveTab] = useState('Image to Prompt')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-[1400px] mx-auto px-6 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-[36px] sm:text-[40px] leading-[1.15] font-semibold tracking-[-0.02em] mb-3 text-balance">
            AI-Powered Prompts for Your Creativity
          </h1>
          <p className="text-responsive text-muted-foreground max-w-[500px] mx-auto">
            Generate unique prompts for writing, design, and art. Upload an image or select a category.
          </p>
        </div>

        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        }>
          {activeTab === 'Image to Prompt' && <ImageUploadSection />}
          {activeTab !== 'Image to Prompt' && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
              <p className="text-muted-foreground">This feature is currently under development.</p>
            </div>
          )}
        </Suspense>
        
        <ContentSection />
      </main>
    </div>
  )
}


'use client'
import { NavigationMenu } from "../components/navigation-menu"
import { TabNavigation } from "../components/tab-navigation"
import { ContentSection } from "../components/content-section"
import { ImageUploadSection } from "../components/image-upload-section"
import { useState } from "react"

export default function Home() {
  const [activeTab, setActiveTab] = useState('Image to Prompt')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavigationMenu />
      
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-16 md:mb-20">
          <h1 className="text-[36px] sm:text-[40px] leading-[1.2] font-semibold tracking-[-0.02em] mb-4 text-balance">
            AI-Powered Prompts for Your Creativity
          </h1>
          <p className="text-responsive text-muted-foreground max-w-[500px] mx-auto">
            Generate unique prompts for writing, design, and art. Upload an image or select a category.
          </p>
        </div>

        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === 'Image to Prompt' && <ImageUploadSection />}
        {activeTab !== 'Image to Prompt' && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">This feature is currently under development.</p>
          </div>
        )}
        
        <ContentSection />
      </main>
    </div>
  )
}


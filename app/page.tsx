'use client'
import { NavigationMenu } from "../components/navigation-menu"
import { TabNavigation } from "../components/tab-navigation"
import { ContentSection } from "../components/content-section"
import { ImageUploadSection } from "../components/image-upload-section"
import { BlogSection } from "../components/blog-section"
import { useState } from "react"

export default function Home() {
  const [activeTab, setActiveTab] = useState('Image')

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavigationMenu />
      
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-[44px] leading-[1.15] font-semibold tracking-[-0.02em] mb-6">
            Unlocking Human Potential
            <br />
            With Generative AI.
          </h1>
          <p className="text-[18px] leading-[1.6] text-muted-foreground max-w-[600px] mx-auto">
            Developing and providing open-source AI models
            <br />
            for creative problem-solving and industrial use.
          </p>
        </div>

        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === 'Image' && <ImageUploadSection />}
        {activeTab === 'Blog' && <BlogSection />}
        {activeTab !== 'Image' && activeTab !== 'Blog' && (
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


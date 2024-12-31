import { NavigationMenu } from "../components/navigation-menu"
import { TabNavigation } from "../components/tab-navigation"
import { ContentSection } from "../components/content-section"
import { ImageUploadSection } from "../components/image-upload-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationMenu />
      
      <main className="max-w-[1400px] mx-auto px-6 pt-32 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-[44px] leading-[1.15] font-semibold tracking-[-0.02em] mb-6">
            Unlocking Human Potential
            <br />
            With Generative AI.
          </h1>
          <p className="text-[18px] leading-[1.6] text-[#666666] max-w-[600px] mx-auto">
            Developing and providing open-source AI models
            <br />
            for creative problem-solving and industrial use.
          </p>
        </div>

        <TabNavigation />
        <ImageUploadSection />
        <ContentSection />
      </main>
    </div>
  )
}


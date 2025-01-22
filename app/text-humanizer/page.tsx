import { Metadata } from "next"
import { TextHumanizerSection } from "@/components/text-humanizer-section"

export const metadata: Metadata = {
  title: 'AI Text Humanizer | PromptBaase',
  description: 'Transform AI-generated text into natural, human-like language with advanced controls',
}

export default function TextHumanizerPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl font-bold tracking-normal bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent sm:text-5xl leading-[1.2] py-2">
            AI Text Humanizer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform AI-generated text into more human-like language with advanced controls
          </p>
        </div>
        
        <TextHumanizerSection />
      </div>
    </main>
  )
} 
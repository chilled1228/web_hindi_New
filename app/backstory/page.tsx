import { Metadata } from "next"
import { BackstoryGeneratorSection } from "@/components/backstory-generator-section"

export const metadata: Metadata = {
  title: 'AI Backstory Generator | PromptBaase',
  description: 'Create compelling character backstories with Saze AI – Bring your characters to life.'
}

export default function BackstoryGeneratorPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl font-bold tracking-normal bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent sm:text-5xl leading-[1.2] py-2">
            AI Backstory Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create compelling character backstories with Saze AI – Bring your characters to life.
          </p>
        </div>
        
        <BackstoryGeneratorSection />
      </div>
    </main>
  )
} 
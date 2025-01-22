import { ImageUploadSection } from "@/components/image-upload-section"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Image to Prompt | PromptBaase',
  description: 'Convert your images into detailed prompts using AI',
}

export default function ImageToPromptPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl font-bold tracking-normal bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent sm:text-5xl leading-[1.2] py-2">
            Image to Prompt
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload an image or paste a URL to generate detailed prompts using AI.
          </p>
        </div>
        
        <ImageUploadSection />
      </div>
    </main>
  )
} 
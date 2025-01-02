'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, ImageIcon, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'

export function ImageUploadSection() {
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { promptsRemaining, fetchUserData, user } = useAuth()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      setImageFile(file)
      setGeneratedPrompt(null) // Reset prompt when new image is uploaded
      setError(null) // Reset error when new image is uploaded
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const generatePrompt = async () => {
    if (!imageFile || !user) return
    if (promptsRemaining !== null && promptsRemaining <= 0) {
      setError('You have reached your monthly prompt generation limit')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          resolve(base64String.split(',')[1]) // Remove data URL prefix
        }
        reader.readAsDataURL(imageFile)
      })

      // Call Gemini API
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          mimeType: imageFile.type,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to generate prompt')
      }

      if (!data.output) {
        throw new Error('No output received from the server')
      }

      setGeneratedPrompt(data.output)
      // Refresh user data to update prompt count
      await fetchUserData(user.id)
    } catch (error) {
      console.error('Error generating prompt:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate prompt')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 mb-8 md:mb-16">
      <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4 md:gap-8">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            relative flex flex-col items-center justify-center
            min-h-[300px] md:min-h-[400px] p-4 md:p-8 rounded-3xl border-2 border-dashed
            transition-colors cursor-pointer
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary hover:bg-accent'}
          `}
        >
          <input {...getInputProps()} />
          
          {preview ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-[360px] rounded-2xl object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 mb-6 rounded-full bg-accent flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Drop your image here
              </h3>
              <p className="text-muted-foreground mb-6">
                or click to browse from your computer
              </p>
              <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                Supports JPG, PNG and WEBP
              </div>
            </div>
          )}
        </div>

        {/* Generate Prompt Section */}
        <div className="bg-accent rounded-3xl p-8">
          <h3 className="text-xl font-semibold mb-4">
            Generate Image Description
          </h3>
          <p className="text-muted-foreground mb-6">
            Upload an image and our AI will generate a detailed description that you can use as a prompt.
          </p>
          {generatedPrompt && (
            <div className="mb-6">
              <div className="p-4 bg-background rounded-lg border border-border">
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground">
                  {generatedPrompt}
                </p>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPrompt);
                  }}
                  className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 py-1 px-2 rounded hover:bg-primary/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  Copy
                </button>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
              <p className="text-sm">{error}</p>
            </div>
          )}
          <button 
            className="w-full px-4 py-3 text-[14px] font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={!preview || isLoading || (promptsRemaining !== null && promptsRemaining <= 0)}
            onClick={generatePrompt}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Prompt'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}


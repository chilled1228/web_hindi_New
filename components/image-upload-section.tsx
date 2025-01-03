'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { ArrowUpFromLine, RotateCcw, ImageIcon, History, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from '@/lib/utils'
import { HistoryDialog } from './history-dialog'
import { usePromptHistory } from '@/lib/hooks/use-prompt-history'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export function ImageUploadSection() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [promptStyle, setPromptStyle] = useState('Photography')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { savePrompt } = usePromptHistory()

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsSignedIn(!!user)
      console.log('Auth state changed:', user ? 'Signed in' : 'Signed out')
    })

    return () => unsubscribe()
  }, [])

  const handleImageFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setImageFile(file)
    setImageUrl('')
    setGeneratedPrompt(null)
    setError(null)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      handleImageFile(file)
    }
  }, [])

  // Handle image paste
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            handleImageFile(file)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  const handleLoadUrl = async () => {
    if (!imageUrl) return
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error('Failed to fetch image')
      
      const blob = await response.blob()
      const file = new File([blob], 'image.jpg', { type: blob.type })
      handleImageFile(file)
    } catch (error) {
      setError('Invalid image URL or unable to load image')
      console.error('Error loading image URL:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generatePrompt = async () => {
    if (!imageFile && !imageUrl) return
    if (!isSignedIn) {
      setError('Please sign in to generate prompts')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      let base64Data, mimeType;

      if (imageFile) {
        // Convert file to base64
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(imageFile)
        })

        // Extract base64 data and mime type
        const matches = (base64Image as string).match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) throw new Error('Invalid image format')
        ;[, mimeType, base64Data] = matches
      } else if (imageUrl) {
        // Fetch image from URL and convert to base64
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })

        // Extract base64 data and mime type
        const matches = (base64Image as string).match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) throw new Error('Invalid image format')
        ;[, mimeType, base64Data] = matches
      }

      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: mimeType,
          promptType: promptStyle.toLowerCase()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to generate prompt')
      }

      setGeneratedPrompt(data.output)
      setIsLoading(false) // Reset loading state after successful generation

      // Save to prompt history
      try {
        await savePrompt({
          promptType: promptStyle,
          inputImage: `data:${mimeType};base64,${base64Data}`,
          outputText: data.output
        })
        console.log('Prompt saved to history successfully')
      } catch (error) {
        console.error('Error saving to history:', error)
        // Don't throw here to avoid interrupting the main flow
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate prompt')
      console.error('Error generating prompt:', error)
      setIsLoading(false) // Reset loading state on error
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const resetAll = () => {
    setPreview(null)
    setImageFile(null)
    setImageUrl('')
    setGeneratedPrompt(null)
    setError(null)
  }

  return (
    <div className="w-full">
      {/* Prompt Style Selector */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Prompt Style:</span>
          <Select value={promptStyle} onValueChange={setPromptStyle}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Photography">Photography</SelectItem>
              <SelectItem value="Illustration">Illustration</SelectItem>
              <SelectItem value="Painting">Painting</SelectItem>
              <SelectItem value="3D">3D Render</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <HistoryDialog />
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-8 w-8 hover:bg-gray-100"
            onClick={resetAll}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-[1.5fr,1fr] gap-6">
        {/* Left Section - Image Upload */}
        <div className="space-y-4">
          {/* Dropzone Area */}
          <div
            {...getRootProps()}
            className={cn(
              'relative rounded-lg border-2 border-dashed border-gray-300 transition-colors',
              'bg-white p-12 text-center cursor-pointer min-h-[300px] flex items-center justify-center',
              isDragActive && 'border-primary bg-primary/5'
            )}
          >
            <input {...getInputProps()} />
            {preview ? (
              <div className="relative w-full h-full">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-full max-w-full object-contain mx-auto"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full h-8 w-8 bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPreview(null)
                    setImageFile(null)
                  }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                  </svg>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <ArrowUpFromLine className="h-10 w-10 text-gray-400" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Drop your image here</h3>
                  <p className="text-sm text-gray-500">or click to browse from your computer</p>
                  <p className="text-sm text-gray-500">You can also paste an image directly (Ctrl/Cmd + V)</p>
                </div>
                <div className="text-xs text-gray-400">
                  Supports JPG, PNG and WEBP
                </div>
              </div>
            )}
          </div>

          {/* URL Input Section */}
          <div className="space-y-2">
            <p className="text-center text-sm text-gray-500">Or add image from URL</p>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Paste image URL here"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="secondary"
                onClick={handleLoadUrl}
                disabled={!imageUrl || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Load URL'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Section - Generate */}
        <div className="space-y-4">
          <Button 
            className="w-full bg-gray-500 hover:bg-gray-600 text-white flex items-center gap-2" 
            size="lg"
            disabled={(!imageFile && !imageUrl) || isLoading || !isSignedIn}
            onClick={generatePrompt}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : 'Generate Prompt'}
          </Button>
          
          <div className="rounded-lg bg-gray-50 p-4 min-h-[200px]">
            {error ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-red-500">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            ) : generatedPrompt ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Generated Prompt</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{generatedPrompt}</p>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-sm">Generated Prompt</p>
                </div>
              </div>
            )}
          </div>

          {!isSignedIn && (
            <p className="text-center text-sm text-gray-500">
              Please sign in to generate prompts
            </p>
          )}
        </div>
      </div>
    </div>
  )
}


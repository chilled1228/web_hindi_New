'use client'

import { useCallback, useState, useEffect, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, ImageIcon, Loader2, Link as LinkIcon, X, ClipboardCopy, Settings } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { HistoryDialog } from './history-dialog'

export function ImageUploadSection() {
  // State for managing image data
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [promptType, setPromptType] = useState<string>('photography')
  const { promptsRemaining, fetchUserData, user } = useAuth()

  // Handle image file upload through drag & drop or file selection
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      setImageFile(file)
      setImageUrl('') // Reset URL input when file is uploaded
      setGeneratedPrompt(null)
      setError(null)
    }
  }, [])

  // Handle URL input change
  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value)
  }, [])

  // Clear URL input
  const clearUrl = useCallback(() => {
    setImageUrl('')
  }, [])

  // Handle image paste functionality
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)
            setImageFile(file)
            setImageUrl('') // Reset URL input when image is pasted
            setGeneratedPrompt(null)
            setError(null)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [])

  // Handle image URL input
  const handleUrlSubmit = useCallback(async () => {
    if (!imageUrl) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error('Failed to fetch image')
      
      const blob = await response.blob()
      const file = new File([blob], 'image.jpg', { type: blob.type })
      
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      setImageFile(file)
      setGeneratedPrompt(null)
    } catch (error) {
      setError('Invalid image URL or unable to load image')
      console.error('Error loading image URL:', error)
    } finally {
      setIsLoading(false)
    }
  }, [imageUrl])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  // Handle prompt generation
  const generatePrompt = useCallback(async () => {
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
          resolve(base64String.split(',')[1])
        }
        reader.readAsDataURL(imageFile)
      })

      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          mimeType: imageFile.type,
          promptType: promptType,
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
      await fetchUserData(user.id)
    } catch (error) {
      console.error('Error generating prompt:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate prompt')
    } finally {
      setIsLoading(false)
    }
  }, [imageFile, user, promptType, promptsRemaining, fetchUserData])

  return (
    <div className="max-w-[1400px] mx-auto px-2 md:px-6 mb-4 md:mb-8">
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr,1fr] gap-4 md:gap-6">
        {/* Upload Area */}
        <div className="flex flex-col gap-4">
          {/* Drag & Drop Area */}
          <div
            {...getRootProps()}
            className={`
              relative flex flex-col items-center justify-center
              min-h-[240px] md:min-h-[320px] p-4 md:p-8 rounded-2xl border-2 border-dashed
              transition-all duration-300 cursor-pointer bg-background/50
              backdrop-blur-[8px] shadow-sm will-change-transform transform translate-z-0
              group
              ${isDragActive 
                ? 'border-primary bg-primary/5 scale-[0.99] shadow-primary/5' 
                : 'border-border hover:border-primary/50 hover:bg-accent/50'}
            `}
          >
            <input {...getInputProps()} />
            
            {preview ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-[280px] rounded-xl object-contain transition-transform duration-300 group-hover:scale-[0.98] shadow-md will-change-transform"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center backdrop-blur-[8px]">
                  <p className="text-white font-medium tracking-tight">Click or drag to replace</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 mb-5 rounded-full bg-accent/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm will-change-transform">
                  <Upload className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2 tracking-tight">
                  Drop your image here
                </h3>
                <p className="text-sm text-muted-foreground/90 mb-1.5">
                  or click to browse from your computer
                </p>
                <p className="text-sm text-muted-foreground/90 mb-5">
                  You can also paste an image directly (Ctrl/Cmd + V)
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/80 bg-muted/50 px-3 py-1.5 rounded-full">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Supports JPG, PNG and WEBP
                </div>
              </div>
            )}
          </div>

          {/* Image URL Input */}
          <div className="flex flex-col items-center text-center p-4 rounded-xl bg-accent/50 backdrop-blur-[8px] shadow-sm will-change-transform transform translate-z-0">
            <p className="text-xs font-medium text-muted-foreground/90 mb-3">
              Or add image from URL
            </p>
            <div className="flex gap-2.5 w-full max-w-2xl">
              <div className="relative flex-1">
                <Input
                  type="url"
                  placeholder="Paste image URL here"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  className="pr-8 text-sm shadow-sm"
                />
                {imageUrl && (
                  <button
                    onClick={clearUrl}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={handleUrlSubmit}
                disabled={!imageUrl || isLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center text-sm font-medium shadow-sm will-change-transform"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    Load URL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Generate Prompt Section */}
        <div className="bg-accent/50 backdrop-blur-[2px] rounded-2xl p-4 md:p-6 sticky top-20 h-fit max-h-[calc(100vh-100px)] overflow-y-auto shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold tracking-tight">
              Generate Description
            </h3>
            <HistoryDialog />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Upload an image and our AI will generate a detailed description that you can use as a prompt.
          </p>
          
          {/* Prompt Type Selector */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Prompt Type
            </label>
            <Select value={promptType} onValueChange={setPromptType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="photography">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <ImageIcon className="w-3 h-3 text-blue-500" />
                    </div>
                    Photography
                  </div>
                </SelectItem>
                <SelectItem value="painting">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <ImageIcon className="w-3 h-3 text-purple-500" />
                    </div>
                    Painting
                  </div>
                </SelectItem>
                <SelectItem value="character">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <ImageIcon className="w-3 h-3 text-green-500" />
                    </div>
                    Character
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {generatedPrompt && (
            <div className="mb-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="text-xs whitespace-pre-wrap break-words leading-relaxed text-foreground">
                  {generatedPrompt}
                </p>
              </div>
              <div className="mt-1.5 flex justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPrompt);
                  }}
                  className="text-[11px] text-primary hover:text-primary/80 transition-colors flex items-center gap-1 py-1 px-2 rounded-md hover:bg-primary/10"
                >
                  <ClipboardCopy className="w-3 h-3" />
                  Copy to clipboard
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-bottom-4">
              <p className="text-xs">{error}</p>
            </div>
          )}

          <button 
            className="w-full px-4 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all hover:scale-[0.98] disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            disabled={!preview || isLoading || (promptsRemaining !== null && promptsRemaining <= 0)}
            onClick={generatePrompt}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Prompt'
            )}
          </button>

          {promptsRemaining !== null && (
            <p className="text-[11px] text-muted-foreground text-center mt-3">
              {promptsRemaining} prompts remaining
            </p>
          )}
        </div>
      </div>

      {/* How to Use Guide Section */}
      <div className="mt-8 p-6 bg-gradient-to-br from-accent/50 via-accent/30 to-background rounded-2xl border border-accent">
        <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          How to Use
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-4 bg-background/80 rounded-xl backdrop-blur-sm border border-accent hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">1. Drop It Like It's Hot</h3>
            <p className="text-sm text-muted-foreground">
              Drag, drop, paste, or URL it here. We're not picky, we just love your pixels! 📸
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 bg-background/80 rounded-xl backdrop-blur-sm border border-accent hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">2. Pick Your Flavor</h3>
            <p className="text-sm text-muted-foreground">
              Photography, painting, or character? Choose your style and let the magic begin! ✨
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4 bg-background/80 rounded-xl backdrop-blur-sm border border-accent hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardCopy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">3. Prompt-ly Yours</h3>
            <p className="text-sm text-muted-foreground">
              Our AI will whip up a prompt faster than you can say "masterpiece"! 🎨
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-medium text-primary">Pro Tip:</span> Clear, well-lit images work best! And yes, you can Ctrl+V – we're living in the future! 🚀
          </p>
        </div>
      </div>
    </div>
  )
}


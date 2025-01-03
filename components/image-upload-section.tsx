'use client'

import { useCallback, useState, useEffect, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, ImageIcon, Loader2, Link as LinkIcon, X, ClipboardCopy, Settings } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { HistoryDialog } from './history-dialog'
import { useAuthNotification } from '@/lib/hooks/use-auth-notification'

export function ImageUploadSection() {
  // State for managing image data
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [promptType, setPromptType] = useState<string>('photography')
  const { user, isLoaded } = useAuth()
  useAuthNotification()

  // Handle image file upload through drag & drop or file selection
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              }
            },
            'image/jpeg',
            0.8
          );
        };
      };
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsLoading(true);
      try {
        const compressedFile = await compressImage(file);
        const objectUrl = URL.createObjectURL(compressedFile);
        setPreview(objectUrl);
        setImageFile(compressedFile);
        setImageUrl('');
        setGeneratedPrompt(null);
        setError(null);
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Failed to process image');
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

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
    if (!imageFile || !user) return;

    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
    });

    try {
      reader.readAsDataURL(imageFile);
      const base64Image = await base64Promise;

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
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to generate prompt');
      }

      if (!data.output) {
        throw new Error('No output received from the server');
      }

      setGeneratedPrompt(data.output);
    } catch (error) {
      console.error('Error generating prompt:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate prompt');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, user, promptType]);

  // Only render content if auth is loaded
  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-[240px]">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  }

  return (
    <div className="relative space-y-6">
      {/* Add History Dialog */}
      <div className="absolute top-4 right-4 z-10">
        <HistoryDialog />
      </div>

      {/* Prompt Type Selector */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-accent/50 backdrop-blur-[8px]">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Prompt Style:</span>
        </div>
        <Select value={promptType} onValueChange={setPromptType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="photography">Photography</SelectItem>
            <SelectItem value="illustration">Illustration</SelectItem>
            <SelectItem value="painting">Painting</SelectItem>
            <SelectItem value="3d">3D Render</SelectItem>
            <SelectItem value="graphic">Graphic Design</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
        {/* Left Column - Image Upload */}
        <div className="space-y-4">
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
                ? 'border-primary bg-primary/5 scale-[0.99] shadow-primary/5 ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50 hover:bg-accent/50 hover:ring-2 hover:ring-primary/10'}
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

        {/* Right Column - Generated Prompt */}
        <div className="space-y-4">
          <button
            onClick={generatePrompt}
            disabled={!imageFile || isLoading || !user}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center text-sm font-medium shadow-sm will-change-transform relative overflow-hidden"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Prompt...
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                Generate Prompt
              </>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {generatedPrompt && (
            <div className="p-4 rounded-xl bg-accent/50 backdrop-blur-[8px] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Generated Prompt</h3>
                <button
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(generatedPrompt)
                    }
                  }}
                  className="p-2 hover:bg-accent rounded-lg transition-colors duration-200"
                >
                  <ClipboardCopy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {generatedPrompt}
              </p>
            </div>
          )}

          {!user && (
            <div className="p-4 rounded-xl bg-accent text-sm text-center">
              Please sign in to generate prompts
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


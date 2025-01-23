'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Loader2, Heart, Eye, Check, Edit, Copy, ChevronLeft, ChevronRight, Expand, Plus, X } from 'lucide-react'
import NextImage from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { ImageUpload } from '@/components/blog/image-upload'
import { MultiImageUpload } from '@/components/blog/multi-image-upload'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils'

interface Prompt {
  id: string
  title: string
  description: string
  category: string
  imageUrl: string
  additionalImages?: string[]
  createdAt: string
  favorites?: number
  views?: number
  examples?: string[]
  author?: {
    name: string
    avatar?: string
  }
  promptText?: string
}

export default function PromptPage() {
  const { id } = useParams()
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPrompt, setEditedPrompt] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser
      if (!user) return

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      setIsAdmin(userDoc.exists() && userDoc.data()?.isAdmin === true)
    }

    checkAdminStatus()
  }, [])

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const promptDoc = await getDoc(doc(db, 'prompts', id as string))
        if (!promptDoc.exists()) {
          setError('Prompt not found')
          return
        }
        const promptData = {
          id: promptDoc.id,
          ...promptDoc.data()
        } as Prompt
        setPrompt(promptData)
        if (promptData.promptText) {
          setEditedPrompt(promptData.promptText)
        }
        if (promptData.additionalImages) {
          setAdditionalImages(promptData.additionalImages)
        }
      } catch (err) {
        setError('Error fetching prompt')
        console.error('Error fetching prompt:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrompt()
  }, [id])

  useEffect(() => {
    if (prompt?.additionalImages) {
      setAdditionalImages(prompt.additionalImages)
    }
  }, [prompt?.additionalImages])

  const handleSavePrompt = async () => {
    if (!prompt) return
    try {
      setIsUploadingImages(true)
      await updateDoc(doc(db, 'prompts', prompt.id), {
        promptText: editedPrompt,
        additionalImages: additionalImages
      })
      setIsEditing(false)
      setPrompt(prev => prev ? { ...prev, promptText: editedPrompt, additionalImages } : null)
      toast({
        title: "Success",
        description: "Prompt updated successfully",
      })
    } catch (error) {
      console.error('Error updating prompt:', error)
      toast({
        title: "Error",
        description: "Failed to update prompt",
        variant: "destructive",
      })
    } finally {
      setIsUploadingImages(false)
    }
  }

  const handleCopyPrompt = () => {
    if (!prompt?.promptText) return
    navigator.clipboard.writeText(prompt.promptText)
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard",
    })
  }

  const handleAddImages = (urls: string[]) => {
    if (!urls.length) return
    setAdditionalImages(prev => [...prev, ...urls])
    toast({
      title: "Success",
      description: `${urls.length} image${urls.length === 1 ? '' : 's'} added successfully`,
    })
  }

  const handleRemoveImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index))
    toast({
      title: "Success",
      description: "Image removed successfully",
    })
  }

  const allImages = prompt ? [
    prompt.imageUrl,
    ...(prompt.additionalImages || []),
    ...(prompt.examples || [])
  ] : []

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !prompt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-muted-foreground">{error || 'Something went wrong'}</p>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image Gallery */}
        <div className="space-y-6">
          {/* Main Image Carousel */}
          <Card className="overflow-hidden bg-gradient-to-br from-pink-100 to-orange-100">
            <div className="aspect-square relative group">
              <NextImage
                src={allImages[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1}`}
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Image Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Expand className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </Card>

          {/* Thumbnail Grid */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg border-2",
                    currentImageIndex === index
                      ? "border-primary"
                      : "border-transparent"
                  )}
                >
                  <NextImage
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 25vw, 15vw"
                    className={cn(
                      "transition-opacity",
                      currentImageIndex === index
                        ? "opacity-100"
                        : "opacity-60 hover:opacity-100"
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary" className="px-3 py-1">
                {prompt.category}
              </Badge>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>{prompt.favorites || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{prompt.views || 0}</span>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">{prompt.title}</h1>
          </div>

          {/* Author */}
          {prompt.author && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              {prompt.author.avatar && (
                <NextImage
                  src={prompt.author.avatar}
                  alt={prompt.author.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{prompt.author.name}</p>
                <p className="text-sm text-muted-foreground">Creator</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="prose prose-gray dark:prose-invert">
            <p className="text-lg text-muted-foreground">{prompt.description}</p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-4">
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Check className="h-4 w-4" /> High Quality
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Check className="h-4 w-4" /> Tested
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
              <Check className="h-4 w-4" /> Examples Included
            </Badge>
          </div>

          {/* Admin Prompt Editor */}
          {isAdmin && (
            <div className="border rounded-lg p-4 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Prompt Text (Admin Only)</h3>
                {isEditing ? (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSavePrompt} disabled={isUploadingImages}>
                      {isUploadingImages ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>

              {isEditing && (
                <>
                  <div className="space-y-4">
                    <Textarea
                      value={editedPrompt}
                      onChange={(e) => setEditedPrompt(e.target.value)}
                      className="min-h-[200px] font-mono"
                      placeholder="Enter the prompt text here..."
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Additional Images</h4>
                      <p className="text-sm text-muted-foreground">
                        {additionalImages.length} image{additionalImages.length !== 1 ? 's' : ''} added
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {additionalImages.map((image, index) => (
                        <div key={index} className="relative group aspect-square">
                          <NextImage
                            src={image}
                            alt={`Additional image ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <div className="aspect-square border-2 border-dashed rounded-lg">
                        <MultiImageUpload
                          onImagesSelected={handleAddImages}
                          disabled={isUploadingImages}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!isEditing && (
                <pre className="bg-muted p-4 rounded-lg whitespace-pre-wrap font-mono">
                  {prompt.promptText || 'No prompt text added yet.'}
                </pre>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-6">
            {prompt.promptText ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full">
                    Get Prompt
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Prompt Text</DialogTitle>
                    <DialogDescription>
                      Copy this prompt to use with your favorite AI model
                    </DialogDescription>
                  </DialogHeader>
                  <div className="relative mt-4">
                    <pre className="bg-muted p-6 rounded-lg whitespace-pre-wrap font-mono text-sm">
                      {prompt.promptText}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-4 right-4"
                      onClick={handleCopyPrompt}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button size="lg" className="w-full" disabled>
                Prompt Coming Soon
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-7xl w-full h-[90vh]">
          <div className="relative w-full h-full">
            <NextImage
              src={allImages[currentImageIndex]}
              alt={`Full size image ${currentImageIndex + 1}`}
              fill
              style={{ objectFit: "contain" }}
              priority
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
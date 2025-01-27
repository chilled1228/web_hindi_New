'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, updateDoc, collection, getDocs, where, query, limit } from 'firebase/firestore'
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
import Link from 'next/link'

interface Prompt {
  id: string
  title: string
  description: string
  category: string
  imageUrl: string
  additionalImages?: {
    url: string
    alt?: string
    title?: string
    caption?: string
    description?: string
  }[]
  createdAt: string
  favorites?: number
  views?: number
  examples?: string[]
  author?: {
    name: string
    avatar?: string
  }
  promptText?: string
  slug: string
}

export default function PromptPage() {
  const params = useParams()
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
  const [suggestedPrompts, setSuggestedPrompts] = useState<Prompt[]>([])

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
        setLoading(true)
        // First try to find by slug
        const slugQuery = query(
          collection(db, 'prompts'),
          where('slug', '==', params.id)
        )
        const slugSnapshot = await getDocs(slugQuery)
        
        if (!slugSnapshot.empty) {
          const doc = slugSnapshot.docs[0]
          setPrompt({ id: doc.id, ...doc.data() } as Prompt)
          return
        }

        // If not found by slug, try to find by ID (for backward compatibility)
        const docRef = doc(db, 'prompts', params.id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setPrompt({ id: docSnap.id, ...docSnap.data() } as Prompt)
        } else {
          setError('Prompt not found')
        }
      } catch (error) {
        console.error('Error fetching prompt:', error)
        setError('Failed to load prompt')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPrompt()
    }
  }, [params.id])

  useEffect(() => {
    if (prompt?.additionalImages) {
      setAdditionalImages(prompt.additionalImages.map(img => img.url))
    }
  }, [prompt?.additionalImages])

  useEffect(() => {
    const fetchSuggestedPrompts = async () => {
      if (!prompt) return
      try {
        // Simple query that only filters by category and limits results
        const suggestedQuery = query(
          collection(db, 'prompts'),
          where('category', '==', prompt.category),
          limit(10)
        )
        const suggestedSnapshot = await getDocs(suggestedQuery)
        const allSuggestedPrompts = suggestedSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Prompt))
          .filter(suggestedPrompt => suggestedPrompt.slug !== prompt.slug)
          .slice(0, 4)
        
        setSuggestedPrompts(allSuggestedPrompts)
      } catch (error) {
        console.error('Error fetching suggested prompts:', error)
      }
    }

    if (prompt) {
      fetchSuggestedPrompts()
    }
  }, [prompt])

  const handleSavePrompt = async () => {
    if (!prompt) return
    try {
      setIsUploadingImages(true)
      await updateDoc(doc(db, 'prompts', prompt.id), {
        promptText: editedPrompt,
        additionalImages: additionalImages.map(url => ({ url }))
      })
      setIsEditing(false)
      setPrompt(prev => prev ? { ...prev, promptText: editedPrompt, additionalImages: additionalImages.map(url => ({ url })) } : null)
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
    ...(prompt.additionalImages?.map(img => img.url) || []),
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
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="container max-w-6xl px-4 py-8 mx-auto">
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <div className="container max-w-6xl px-4 py-8 mx-auto">
          <div className="text-center text-red-500">{error || 'Something went wrong'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <div className="container max-w-7xl px-4 py-6 mx-auto">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Image and Details */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Image */}
            <div className="relative h-[300px] rounded-xl border shadow-lg group">
              <NextImage
                src={prompt.imageUrl}
                alt={prompt.title}
                fill
                className="object-contain transition-all duration-300 group-hover:scale-105"
                priority
              />
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute bottom-4 right-4 bg-black/70 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
              >
                <Expand className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnails in a row */}
            {prompt.additionalImages && prompt.additionalImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                {prompt.additionalImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 flex-none overflow-hidden rounded-lg cursor-pointer group"
                    onClick={() => {
                      setCurrentImageIndex(index + 1)
                      setShowImageModal(true)
                    }}
                  >
                    <NextImage
                      src={img.url}
                      alt={img.alt || `Additional image ${index + 1}`}
                      fill
                      className="object-contain transition-all duration-300 group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Author Info */}
            {prompt.author && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                {prompt.author.avatar && (
                  <NextImage
                    src={prompt.author.avatar}
                    alt={prompt.author.name}
                    width={40}
                    height={40}
                    className="rounded-full ring-2 ring-primary/20"
                  />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Created by</p>
                  <p className="font-semibold">{prompt.author.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                  {prompt.category}
                </Badge>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    {prompt.favorites || 0}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {prompt.views || 0}
                  </span>
                </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">{prompt.title}</h2>
              <p className="text-muted-foreground">{prompt.description}</p>
            </div>

            {/* Tabs for Different Sections */}
            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                {/* Prompt Text Section */}
                <Card className="p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <Edit className="w-4 h-4 text-primary" />
                      </div>
                      <h2 className="font-semibold">Prompt Text</h2>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyPrompt}
                      className="gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </Button>
                  </div>

                  {isAdmin ? (
                    <div className="space-y-3">
                      {isEditing ? (
                        <>
                          <Textarea
                            value={editedPrompt}
                            onChange={(e) => setEditedPrompt(e.target.value)}
                            className="min-h-[120px] font-mono text-sm"
                            placeholder="Enter your prompt text here..."
                          />
                          <div className="flex gap-2">
                            <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">
                              Cancel
                            </Button>
                            <Button onClick={handleSavePrompt} size="sm" className="flex-1">
                              {isUploadingImages ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="relative group">
                          <pre className="p-3 rounded-md bg-muted font-mono text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                            {prompt.promptText || 'No prompt text available'}
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <pre className="p-3 rounded-md bg-muted font-mono text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                      {prompt.promptText || 'No prompt text available'}
                    </pre>
                  )}
                </Card>

                {/* Examples Section */}
                {prompt.examples && prompt.examples.length > 0 && (
                  <Card className="p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <h2 className="font-semibold">Examples</h2>
                    </div>
                    <ul className="space-y-2">
                      {prompt.examples.map((example, index) => (
                        <li key={index} className="relative pl-4 text-muted-foreground text-sm">
                          <div className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-primary/60" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            </div>

            {/* Admin Image Upload - Collapsed by default */}
            {isAdmin && (
              <Card className="p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="font-semibold">Additional Images</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {additionalImages.length} image{additionalImages.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {additionalImages.map((image, index) => (
                    <div key={index} className="relative aspect-square group rounded-lg">
                      <NextImage
                        src={image}
                        alt={`Additional image ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
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
              </Card>
            )}
          </div>
        </div>

        {/* Suggested Prompts Section */}
        {suggestedPrompts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-semibold mb-6">Similar Prompts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestedPrompts.map((suggestedPrompt) => (
                <Link
                  key={suggestedPrompt.id}
                  href={`/prompts/${suggestedPrompt.slug || suggestedPrompt.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl dark:shadow-primary/5 hover:-translate-y-1 bg-background/60 dark:bg-gray-800/40 backdrop-blur-xl border-primary/10 dark:border-white/5">
                    <div className="relative h-[200px]">
                      <NextImage
                        src={suggestedPrompt.imageUrl}
                        alt={suggestedPrompt.title}
                        fill
                        className="object-contain transition-all duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-4">
                      <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground hover:bg-primary/20 transition-colors duration-300">
                        {suggestedPrompt.category}
                      </Badge>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-1">
                        {suggestedPrompt.title}
                      </h3>
                      <p className="text-sm text-muted-foreground/80 line-clamp-2">
                        {suggestedPrompt.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Image Gallery</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-[16/10]">
            <NextImage
              src={currentImageIndex === 0 ? prompt?.imageUrl || '' : prompt?.additionalImages?.[currentImageIndex - 1]?.url || ''}
              alt={prompt?.title || ''}
              fill
              className="object-contain"
              priority
            />
            {(prompt?.additionalImages?.length || 0) > 0 && (
              <>
                <button
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                  disabled={currentImageIndex === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                  disabled={currentImageIndex === (prompt?.additionalImages?.length || 0)}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
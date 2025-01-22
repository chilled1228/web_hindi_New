'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Loader2, Heart, Eye, Check, Edit, Copy } from 'lucide-react'
import NextImage from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Prompt {
  id: string
  title: string
  description: string
  category: string
  imageUrl: string
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
      } catch (err) {
        setError('Error fetching prompt')
        console.error('Error fetching prompt:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrompt()
  }, [id])

  const handleSavePrompt = async () => {
    if (!prompt) return
    try {
      await updateDoc(doc(db, 'prompts', prompt.id), {
        promptText: editedPrompt
      })
      setIsEditing(false)
      setPrompt(prev => prev ? { ...prev, promptText: editedPrompt } : null)
      toast({
        title: "Success",
        description: "Prompt text updated successfully",
      })
    } catch (error) {
      console.error('Error updating prompt:', error)
      toast({
        title: "Error",
        description: "Failed to update prompt text",
        variant: "destructive",
      })
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
        {/* Left Column - Preview Grid */}
        <div className="space-y-6">
          {/* Main Image */}
          <Card className="overflow-hidden bg-gradient-to-br from-pink-100 to-orange-100">
            <div className="aspect-square relative">
              <NextImage
                src={prompt.imageUrl}
                alt={prompt.title}
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </Card>

          {/* Example Images Grid */}
          {prompt.examples && prompt.examples.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {prompt.examples.map((example, index) => (
                <Card key={index} className="overflow-hidden bg-gradient-to-br from-pink-100 to-orange-100">
                  <div className="aspect-square relative">
                    <NextImage
                      src={example}
                      alt={`Example ${index + 1}`}
                      fill
                      style={{ objectFit: "contain" }}
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">
                {prompt.category}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span>{prompt.favorites || 0}</span>
                <Eye className="h-4 w-4 ml-2" />
                <span>{prompt.views || 0}</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">{prompt.title}</h1>
          </div>

          {/* Author */}
          {prompt.author && (
            <div className="flex items-center gap-3">
              {prompt.author.avatar && (
                <NextImage
                  src={prompt.author.avatar}
                  alt={prompt.author.name}
                  width={40}
                  height={40}
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
            <Badge variant="outline" className="flex items-center gap-1">
              <Check className="h-4 w-4" /> High Quality
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Check className="h-4 w-4" /> Tested
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Check className="h-4 w-4" /> Examples Included
            </Badge>
          </div>

          {/* Admin Prompt Editor */}
          {isAdmin && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Prompt Text (Admin Only)</h3>
                {isEditing ? (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSavePrompt}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              {isEditing ? (
                <Textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="min-h-[200px] font-mono"
                  placeholder="Enter the prompt text here..."
                />
              ) : (
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
            <p className="text-sm text-center text-muted-foreground mt-2">
              This prompt is free to use
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
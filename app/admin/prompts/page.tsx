'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/blog/image-upload'
import { toast } from '@/components/ui/use-toast'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Loader2 } from 'lucide-react'

export default function AdminPromptsPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '', // SEO description
    promptText: '', // Actual prompt text
    price: '0',
    category: '',
    imageUrl: '',
  })

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = auth.currentUser
        console.log('Checking auth state:', { userExists: !!user })
        
        if (!user) {
          console.log('No user found, redirecting to auth...')
          router.push('/auth?redirect=/admin/prompts')
          return
        }

        // Force token refresh to ensure we have the latest claims
        console.log('Refreshing user token...')
        await user.getIdToken(true)
        
        console.log('Fetching user document...')
        const userDocRef = doc(db, 'users', user.uid)
        const userDocSnap = await getDoc(userDocRef)
        
        console.log('User document exists:', userDocSnap.exists(), 'Is admin:', userDocSnap.data()?.isAdmin)
        
        if (!userDocSnap.exists() || !userDocSnap.data()?.isAdmin) {
          console.log('User is not admin, redirecting to home...')
          router.push('/')
          return
        }

        setIsAdmin(true)
        setIsLoading(false)
      } catch (error: any) {
        console.error('Detailed error in checkAdminStatus:', {
          errorMessage: error.message,
          errorCode: error.code,
          errorStack: error.stack
        })
        router.push('/')
      }
    }

    checkAdminStatus()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = auth.currentUser
      if (!user) throw new Error('Not authenticated')

      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create prompt')
      }

      toast({
        title: 'Success',
        description: 'Prompt created successfully',
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        promptText: '',
        price: '0',
        category: '',
        imageUrl: '',
      })
    } catch (error) {
      console.error('Error creating prompt:', error)
      toast({
        title: 'Error',
        description: 'Failed to create prompt',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-4">You need to be an admin to access this page.</p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Prompt</h1>
        <p className="text-muted-foreground">Add a new prompt to the marketplace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter prompt title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            SEO Description
            <span className="text-sm text-muted-foreground ml-2">
              (This will be shown in search results and listings)
            </span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter SEO-friendly description"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promptText">
            Prompt Text
            <span className="text-sm text-muted-foreground ml-2">
              (The actual prompt that users will use)
            </span>
          </Label>
          <Textarea
            id="promptText"
            value={formData.promptText}
            onChange={(e) => setFormData(prev => ({ ...prev, promptText: e.target.value }))}
            placeholder="Enter the actual prompt text"
            className="min-h-[200px] font-mono"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="Enter price (0 for free)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="Enter prompt category"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Preview Image</Label>
          <ImageUpload
            onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
            onRemove={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            'Create Prompt'
          )}
        </Button>
      </form>
    </div>
  )
} 
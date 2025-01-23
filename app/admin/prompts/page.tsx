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
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { Loader2, Trash2, Edit, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Prompt {
  id: string
  title: string
  description: string
  promptText: string
  category: string
  imageUrl: string
  createdAt: string
}

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
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const promptsQuery = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'))
        const promptsSnapshot = await getDocs(promptsQuery)
        const promptsData = promptsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Prompt[]
        setPrompts(promptsData)
      } catch (error) {
        console.error('Error fetching prompts:', error)
        toast({
          title: 'Error',
          description: 'Failed to load prompts',
          variant: 'destructive',
        })
      }
    }

    if (isAdmin) {
      fetchPrompts()
    }
  }, [isAdmin])

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
        body: JSON.stringify({
          ...formData,
          id: selectedPrompt?.id
        }),
      })

      if (!response.ok) {
        throw new Error(isCreating ? 'Failed to create prompt' : 'Failed to update prompt')
      }

      const result = await response.json()

      toast({
        title: 'Success',
        description: result.message,
      })

      // Update prompts list
      if (selectedPrompt) {
        setPrompts(prev => prev.map(p => 
          p.id === selectedPrompt.id 
            ? { ...p, ...formData, id: p.id, createdAt: p.createdAt }
            : p
        ))
      } else {
        const newPrompt = {
          ...formData,
          id: result.promptId,
          createdAt: new Date().toISOString(),
        }
        setPrompts(prev => [newPrompt, ...prev])
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        promptText: '',
        price: '0',
        category: '',
        imageUrl: '',
      })
      setSelectedPrompt(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast({
        title: 'Error',
        description: isCreating ? 'Failed to create prompt' : 'Failed to update prompt',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return
    
    setIsDeleting(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Not authenticated')

      const response = await fetch(`/api/admin/prompts?id=${promptId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete prompt')
      }

      setPrompts(prev => prev.filter(p => p.id !== promptId))
      toast({
        title: 'Success',
        description: 'Prompt deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete prompt',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setFormData({
      title: prompt.title,
      description: prompt.description,
      promptText: prompt.promptText,
      price: '0',
      category: prompt.category,
      imageUrl: prompt.imageUrl,
    })
    setIsCreating(false)
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
    <div className="container max-w-7xl py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Prompts</h1>
          <p className="text-muted-foreground">Create and manage prompts in the marketplace</p>
        </div>
        <Button onClick={() => { setIsCreating(true); setSelectedPrompt(null) }}>
          <Plus className="h-4 w-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Prompts Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell className="font-medium">{prompt.title}</TableCell>
                <TableCell>{prompt.category}</TableCell>
                <TableCell>{new Date(prompt.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(prompt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(prompt.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Form Dialog */}
      <Dialog open={isCreating || !!selectedPrompt} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false)
          setSelectedPrompt(null)
          setFormData({
            title: '',
            description: '',
            promptText: '',
            price: '0',
            category: '',
            imageUrl: '',
          })
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create New Prompt' : 'Edit Prompt'}</DialogTitle>
            <DialogDescription>
              {isCreating ? 'Add a new prompt to the marketplace' : 'Edit an existing prompt'}
            </DialogDescription>
          </DialogHeader>
          
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
                value={formData.imageUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                onRemove={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isCreating ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                isCreating ? 'Create Prompt' : 'Save Changes'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
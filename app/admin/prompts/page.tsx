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
import { MultiImageUpload } from '@/components/blog/multi-image-upload'

interface Prompt {
  id: string
  title: string
  description: string
  promptText: string
  category: string
  imageUrl: string
  additionalImages?: string[]
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
    additionalImages: [] as string[]
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

  const fetchPrompts = async () => {
    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) throw new Error('No authentication token')

      const promptsRef = collection(db, 'prompts')
      const q = query(promptsRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      
      const fetchedPrompts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Prompt[]

      setPrompts(fetchedPrompts)
    } catch (error) {
      console.error('Error fetching prompts:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch prompts',
        variant: 'destructive'
      })
    }
  }

  useEffect(() => {
    fetchPrompts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = await auth.currentUser?.getIdToken()
      if (!token) throw new Error('No authentication token')

      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: selectedPrompt?.id,
          title: formData.title,
          description: formData.description,
          promptText: formData.promptText,
          category: formData.category,
          imageUrl: formData.imageUrl,
          additionalImages: formData.additionalImages
        })
      })

      if (!response.ok) throw new Error('Failed to create/update prompt')

      toast({
        title: isCreating ? 'Prompt Created' : 'Prompt Updated',
        description: isCreating ? 'New prompt has been created successfully.' : 'Prompt has been updated successfully.'
      })

      setIsCreating(false)
      setSelectedPrompt(null)
      fetchPrompts()
    } catch (error) {
      console.error('Error creating/updating prompt:', error)
      toast({
        title: 'Error',
        description: 'Failed to create/update prompt. Please try again.',
        variant: 'destructive'
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
      additionalImages: prompt.additionalImages || []
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
            additionalImages: []
          })
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="sticky top-0 bg-background z-10 pb-6">
            <DialogTitle>{isCreating ? 'Create New Prompt' : 'Edit Prompt'}</DialogTitle>
            <DialogDescription>
              {isCreating ? 'Add a new prompt to the marketplace' : 'Edit an existing prompt'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
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
                  className="h-20"
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
                  className="h-32 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="space-y-2">
                <Label>Preview Image</Label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                  onRemove={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Images</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.additionalImages.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={image}
                        alt={`Additional image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          additionalImages: prev.additionalImages.filter((_, i) => i !== index)
                        }))}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="aspect-square border-2 border-dashed rounded-lg">
                    <MultiImageUpload
                      onImagesSelected={(urls) => setFormData(prev => ({
                        ...prev,
                        additionalImages: [...prev.additionalImages, ...urls]
                      }))}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-background pt-4 pb-2 mt-6">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isCreating ? 'Creating...' : 'Saving...'}
                  </>
                ) : (
                  isCreating ? 'Create Prompt' : 'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
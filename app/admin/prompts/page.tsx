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
import { DialogFooter } from '@/components/ui/dialog'

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Prompts</h1>
        <Button onClick={() => { setIsCreating(true); setSelectedPrompt(null) }} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Prompt
        </Button>
      </div>

      {/* Prompts Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell className="font-medium">{prompt.title}</TableCell>
                <TableCell>{prompt.category}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(prompt.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(prompt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => handleDelete(prompt.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {prompts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No prompts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create Prompt' : 'Edit Prompt'}</DialogTitle>
            <DialogDescription>
              {isCreating ? 'Add a new prompt to the marketplace' : 'Edit an existing prompt'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1.5 h-20"
                  required
                />
              </div>

              <div>
                <Label htmlFor="promptText">Prompt Text</Label>
                <Textarea
                  id="promptText"
                  value={formData.promptText}
                  onChange={(e) => setFormData(prev => ({ ...prev, promptText: e.target.value }))}
                  className="mt-1.5 h-32 font-mono text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1.5"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" size="sm">
                {isCreating ? 'Create Prompt' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
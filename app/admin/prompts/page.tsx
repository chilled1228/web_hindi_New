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
import { Loader2, Trash2, Edit, Plus, Image as ImageIcon, Tag, Clock, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

interface ImageMetadata {
  url: string
  alt: string
  title: string
  caption: string
  description: string
}

interface Prompt {
  id: string
  title: string
  description: string
  promptText: string
  category: string
  imageUrl: string
  imageMetadata?: ImageMetadata
  additionalImages?: ImageMetadata[]
  isPublic?: boolean
  price: number
  createdAt: string
  status?: 'active' | 'draft' | 'archived'
}

const categories = [
  'Writing',
  'Art',
  'Code',
  'Business',
  'Academic',
  'Personal',
  'Other'
]

export default function AdminPromptsPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promptText: '',
    price: '0',
    category: '',
    imageUrl: '',
    imageMetadata: {
      url: '',
      alt: '',
      title: '',
      caption: '',
      description: ''
    },
    additionalImages: [] as ImageMetadata[],
    isPublic: true,
    status: 'active' as 'active' | 'draft' | 'archived'
  })
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

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
      
      const fetchedPrompts = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          promptText: data.promptText || '',
          category: data.category || '',
          imageUrl: data.imageUrl || '',
          imageMetadata: data.imageMetadata || {
            url: data.imageUrl || '',
            alt: '',
            title: '',
            caption: '',
            description: ''
          },
          additionalImages: data.additionalImages || [],
          isPublic: data.isPublic ?? true,
          price: data.price ?? 0,
          createdAt: data.createdAt || new Date().toISOString(),
          status: data.status || 'active'
        } as Prompt
      })

      console.log('Fetched prompts:', fetchedPrompts)
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

      const submitData = {
        id: selectedPrompt?.id,
        ...formData,
        price: Number(formData.price)
      }
      console.log('Submitting data:', submitData)

      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server error response:', errorData)
        throw new Error(errorData.message || 'Failed to create/update prompt')
      }

      toast({
        title: isCreating ? 'Prompt Created' : 'Prompt Updated',
        description: isCreating ? 'New prompt has been created successfully.' : 'Prompt has been updated successfully.'
      })

      setDialogOpen(false)
      setIsCreating(false)
      setSelectedPrompt(null)
      fetchPrompts()
    } catch (error) {
      console.error('Error creating/updating prompt:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create/update prompt. Please try again.',
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
    console.log('Editing prompt:', prompt)
    setSelectedPrompt(prompt)
    const newFormData = {
      title: prompt.title || '',
      description: prompt.description || '',
      promptText: prompt.promptText || '',
      price: (prompt.price ?? 0).toString(),
      category: prompt.category || '',
      imageUrl: prompt.imageUrl || '',
      imageMetadata: prompt.imageMetadata || {
        url: prompt.imageUrl || '',
        alt: '',
        title: '',
        caption: '',
        description: ''
      },
      additionalImages: prompt.additionalImages || [],
      isPublic: prompt.isPublic ?? true,
      status: prompt.status || 'active'
    }
    console.log('Setting form data:', newFormData)
    setFormData(newFormData)
    setIsCreating(false)
    setDialogOpen(true)
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Prompts</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setIsCreating(true); setSelectedPrompt(null) }}>
              <Plus className="h-4 w-4 mr-2" />
              New Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isCreating ? 'Create New Prompt' : 'Edit Prompt'}</DialogTitle>
              <DialogDescription>
                Fill in the details below to {isCreating ? 'create a new prompt' : 'update the prompt'}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="media">Media</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter prompt title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter prompt description"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={checked => setFormData(prev => ({ ...prev, isPublic: checked }))}
                    />
                    <Label htmlFor="isPublic">Make this prompt public</Label>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="promptText">Prompt Text</Label>
                    <Textarea
                      id="promptText"
                      value={formData.promptText}
                      onChange={e => setFormData(prev => ({ ...prev, promptText: e.target.value }))}
                      placeholder="Enter the actual prompt text"
                      className="min-h-[200px]"
                      required
                    />
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Main Image</Label>
                          <p className="text-sm text-muted-foreground mb-4">
                            Add your main image and its SEO metadata to improve visibility and accessibility.
                          </p>
                          <ImageUpload
                            value={formData.imageUrl}
                            onChange={url => {
                              setFormData(prev => ({
                                ...prev,
                                imageUrl: url,
                                imageMetadata: {
                                  ...prev.imageMetadata,
                                  url
                                }
                              }))
                            }}
                            onRemove={() => {
                              setFormData(prev => ({
                                ...prev,
                                imageUrl: '',
                                imageMetadata: {
                                  url: '',
                                  alt: '',
                                  title: '',
                                  caption: '',
                                  description: ''
                                }
                              }))
                            }}
                          />
                        </div>

                        {formData.imageUrl && (
                          <div className="grid gap-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="imageTitle">Image Title</Label>
                                <Input
                                  id="imageTitle"
                                  placeholder="Enter SEO-friendly image title"
                                  value={formData.imageMetadata.title}
                                  onChange={e => setFormData(prev => ({
                                    ...prev,
                                    imageMetadata: {
                                      ...prev.imageMetadata,
                                      title: e.target.value
                                    }
                                  }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="imageAlt">Alt Text</Label>
                                <Input
                                  id="imageAlt"
                                  placeholder="Describe image for accessibility"
                                  value={formData.imageMetadata.alt}
                                  onChange={e => setFormData(prev => ({
                                    ...prev,
                                    imageMetadata: {
                                      ...prev.imageMetadata,
                                      alt: e.target.value
                                    }
                                  }))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="imageCaption">Caption</Label>
                              <Input
                                id="imageCaption"
                                placeholder="Add a caption to display with the image"
                                value={formData.imageMetadata.caption}
                                onChange={e => setFormData(prev => ({
                                  ...prev,
                                  imageMetadata: {
                                    ...prev.imageMetadata,
                                    caption: e.target.value
                                  }
                                }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="imageDescription">SEO Description</Label>
                              <Textarea
                                id="imageDescription"
                                placeholder="Detailed description for search engines"
                                value={formData.imageMetadata.description}
                                onChange={e => setFormData(prev => ({
                                  ...prev,
                                  imageMetadata: {
                                    ...prev.imageMetadata,
                                    description: e.target.value
                                  }
                                }))}
                                className="h-20"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Additional Images</Label>
                          <p className="text-sm text-muted-foreground mb-4">
                            Add up to 5 additional images with SEO metadata.
                          </p>
                          <MultiImageUpload
                            onImagesSelected={(urls: string[]) => {
                              const newImages = urls.map(url => ({
                                url,
                                alt: '',
                                title: '',
                                caption: '',
                                description: ''
                              }))
                              setFormData(prev => ({
                                ...prev,
                                additionalImages: [...prev.additionalImages, ...newImages]
                              }))
                            }}
                            disabled={isLoading || formData.additionalImages.length >= 5}
                          />
                        </div>

                        {formData.additionalImages.length > 0 && (
                          <div className="space-y-6 mt-4">
                            {formData.additionalImages.map((img, index) => (
                              <div key={index} className="border rounded-lg p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium">Image {index + 1}</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        additionalImages: prev.additionalImages.filter((_, i) => i !== index)
                                      }))
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                      placeholder="SEO-friendly image title"
                                      value={img.title}
                                      onChange={e => {
                                        const newImages = [...formData.additionalImages]
                                        newImages[index] = {
                                          ...newImages[index],
                                          title: e.target.value
                                        }
                                        setFormData(prev => ({
                                          ...prev,
                                          additionalImages: newImages
                                        }))
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Alt Text</Label>
                                    <Input
                                      placeholder="Describe image for accessibility"
                                      value={img.alt}
                                      onChange={e => {
                                        const newImages = [...formData.additionalImages]
                                        newImages[index] = {
                                          ...newImages[index],
                                          alt: e.target.value
                                        }
                                        setFormData(prev => ({
                                          ...prev,
                                          additionalImages: newImages
                                        }))
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Caption</Label>
                                  <Input
                                    placeholder="Add a caption to display with the image"
                                    value={img.caption}
                                    onChange={e => {
                                      const newImages = [...formData.additionalImages]
                                      newImages[index] = {
                                        ...newImages[index],
                                        caption: e.target.value
                                      }
                                      setFormData(prev => ({
                                        ...prev,
                                        additionalImages: newImages
                                      }))
                                    }}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>SEO Description</Label>
                                  <Textarea
                                    placeholder="Detailed description for search engines"
                                    value={img.description}
                                    onChange={e => {
                                      const newImages = [...formData.additionalImages]
                                      newImages[index] = {
                                        ...newImages[index],
                                        description: e.target.value
                                      }
                                      setFormData(prev => ({
                                        ...prev,
                                        additionalImages: newImages
                                      }))
                                    }}
                                    className="h-20"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCreating ? 'Create Prompt' : 'Update Prompt'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prompts.map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell className="font-medium">{prompt.title}</TableCell>
                <TableCell>{prompt.category}</TableCell>
                <TableCell>
                  <Badge variant={prompt.status === 'active' ? 'default' : 'secondary'}>
                    {prompt.status || 'active'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(prompt.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(prompt)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(prompt.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 
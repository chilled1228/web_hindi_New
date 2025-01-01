import { useState } from 'react'
import { RichTextEditor } from './rich-text-editor'
import { Upload } from 'lucide-react'

interface BlogEditorProps {
  onSubmit: (data: {
    title: string
    excerpt: string
    content: string
    category: string
    image: string | null
    published: boolean
  }) => void
  initialData?: {
    title: string
    excerpt: string
    content: string
    category: string
    image: string | null
    published: boolean
  }
}

export function BlogEditor({ onSubmit, initialData }: BlogEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [category, setCategory] = useState(initialData?.category ?? '')
  const [image, setImage] = useState<string | null>(initialData?.image ?? null)
  const [published, setPublished] = useState(initialData?.published ?? false)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      
      // Get pre-signed URL
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to get upload URL')
      }
      
      const { uploadUrl, fileUrl } = await response.json()
      
      // Upload file to S3
      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })
      
      setImage(fileUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title,
      excerpt,
      content,
      category,
      image,
      published,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Excerpt</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Featured Image</label>
        <div className="flex items-center gap-4">
          {image && (
            <img
              src={image}
              alt="Featured"
              className="w-32 h-32 object-cover rounded-lg"
            />
          )}
          <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-accent">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleImageUpload(file)
                }
              }}
              className="hidden"
            />
            <Upload className="w-4 h-4" />
            <span className="text-sm">
              {uploading ? 'Uploading...' : 'Upload Image'}
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Content</label>
        <RichTextEditor
          content={content}
          onChange={setContent}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="published" className="text-sm font-medium">
          Publish immediately
        </label>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90"
      >
        Save Post
      </button>
    </form>
  )
} 
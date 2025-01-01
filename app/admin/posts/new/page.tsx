'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'

interface NewPost {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  published: boolean
}

export default function NewPostPage() {
  const router = useRouter()
  const [post, setPost] = useState<NewPost>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    published: false,
  })
  const [saving, setSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setPost(prev => ({ ...prev, content: editor.getHTML() }))
    },
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      })

      if (!response.ok) throw new Error('Failed to create post')
      
      router.push('/admin/posts')
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setSaving(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setPost({
      ...post,
      title,
      slug: generateSlug(title),
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">New Post</h1>
        <button
          onClick={() => router.push('/admin/posts')}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={post.title}
            onChange={handleTitleChange}
            className="w-full p-2 border rounded-md bg-background"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={post.slug}
            onChange={(e) => setPost({ ...post, slug: e.target.value })}
            className="w-full p-2 border rounded-md bg-background"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="excerpt" className="text-sm font-medium">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={post.excerpt}
            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
            className="w-full p-2 border rounded-md bg-background"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <input
            id="category"
            type="text"
            value={post.category}
            onChange={(e) => setPost({ ...post, category: e.target.value })}
            className="w-full p-2 border rounded-md bg-background"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Content
          </label>
          <div className="min-h-[400px] border rounded-md bg-background">
            <EditorContent editor={editor} className="prose max-w-none p-4" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Post'}
          </button>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={post.published}
              onChange={(e) => setPost({ ...post, published: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Published</span>
          </label>
        </div>
      </form>
    </div>
  )
} 
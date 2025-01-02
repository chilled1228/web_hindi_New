'use client'

import { CreatePost } from '@/components/create-post'

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Create a New Post</h1>
        <CreatePost />
      </div>
    </div>
  )
} 
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Users, FileText } from 'lucide-react'

interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/posts')
      const posts = await response.json()
      
      setStats({
        totalPosts: posts.length,
        publishedPosts: posts.filter((post: any) => post.published).length,
        draftPosts: posts.filter((post: any) => !post.published).length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Posts */}
        <div className="p-6 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Posts</p>
              <h3 className="text-2xl font-semibold">{stats.totalPosts}</h3>
            </div>
          </div>
        </div>

        {/* Published Posts */}
        <div className="p-6 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Published Posts</p>
              <h3 className="text-2xl font-semibold">{stats.publishedPosts}</h3>
            </div>
          </div>
        </div>

        {/* Draft Posts */}
        <div className="p-6 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Draft Posts</p>
              <h3 className="text-2xl font-semibold">{stats.draftPosts}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/admin/posts/new')}
            className="p-4 text-left bg-card hover:bg-accent rounded-lg border border-border transition-colors"
          >
            <h3 className="font-medium">Create New Post</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Write and publish a new blog post
            </p>
          </button>
          
          <button
            onClick={() => router.push('/admin/posts')}
            className="p-4 text-left bg-card hover:bg-accent rounded-lg border border-border transition-colors"
          >
            <h3 className="font-medium">Manage Posts</h3>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage all your blog posts
            </p>
          </button>
        </div>
      </div>
    </div>
  )
} 
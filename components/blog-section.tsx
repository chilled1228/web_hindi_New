'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  date: string
  author: {
    name: string
    email: string
  }
  category: string
  image: string | null
  excerpt: string
  content: string
  published: boolean
  createdAt: string
}

export function BlogSection() {
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null)
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlogs()
    // Set up an interval to refresh posts every 5 seconds
    const intervalId = setInterval(fetchBlogs, 5000)
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      setBlogs(data.filter((post: BlogPost) => post.published))
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            onClick={() => setSelectedBlog(blog)}
            className="group cursor-pointer bg-background hover:bg-accent transition-colors duration-200 border-b border-border pb-6 last:border-b-0"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <div className="w-full md:w-[240px] shrink-0">
                <div className="aspect-[16/10] md:aspect-[4/3] overflow-hidden rounded-xl">
                  <img 
                    src={blog.image || 'https://picsum.photos/seed/1/800/600'} 
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-accent rounded-full">
                    {blog.category}
                  </span>
                  <span>•</span>
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {blog.title}
                </h3>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {blog.excerpt}
                </p>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-foreground font-medium">{blog.author.name}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {blogs.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
            <p className="text-muted-foreground">Check back later for new content.</p>
          </div>
        )}
      </div>

      {/* Blog Post Popup */}
      {selectedBlog && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedBlog(null)}
        >
          <div 
            className="bg-background rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedBlog(null)}
              className="absolute right-4 top-4 p-2 rounded-full bg-background/90 hover:bg-accent transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[16/9] relative">
              <img 
                src={selectedBlog.image || 'https://picsum.photos/seed/1/800/600'} 
                alt={selectedBlog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <span className="px-2 py-1 bg-white/20 rounded-full">
                      {selectedBlog.category}
                    </span>
                    <span>•</span>
                    <span>{new Date(selectedBlog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-2xl font-semibold">
                    {selectedBlog.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span>By {selectedBlog.author.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
          </div>
        </div>
      )}
    </>
  )
} 
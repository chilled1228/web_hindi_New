'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface BlogPost {
  title: string
  date: string
  author: string
  category: string
  image: string
  excerpt: string
  content?: string // Full blog content
}

export function BlogSection() {
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null)

  const blogs: BlogPost[] = [
    {
      title: "Getting Started with AI Image Generation",
      date: "March 15, 2024",
      author: "Olivia Rhye",
      category: "Design",
      image: "https://picsum.photos/seed/1/800/600",
      excerpt: "Learn how to create stunning AI-generated images using our latest models and techniques.",
      content: "Full article content here..."
    },
    // ... other blog posts
  ]

  return (
    <>
      <div className="space-y-6">
        {blogs.map((blog, index) => (
          <div
            key={index}
            onClick={() => setSelectedBlog(blog)}
            className="group cursor-pointer bg-white hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 pb-6 last:border-b-0"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image */}
              <div className="w-full md:w-[240px] shrink-0">
                <div className="aspect-[16/10] md:aspect-[4/3] overflow-hidden rounded-xl">
                  <img 
                    src={blog.image} 
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {blog.category}
                  </span>
                  <span>•</span>
                  <span>{blog.date}</span>
                </div>
                
                <h3 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                  {blog.title}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {blog.excerpt}
                </p>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-700 font-medium">{blog.author}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Blog Post Popup */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedBlog(null)}
              className="absolute right-4 top-4 p-2 rounded-full bg-white/90 hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[16/9] relative">
              <img 
                src={selectedBlog.image} 
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
                    <span>{selectedBlog.date}</span>
                  </div>
                  <h2 className="text-2xl font-semibold">
                    {selectedBlog.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span>By {selectedBlog.author}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 prose prose-sm max-w-none">
              {selectedBlog.content || selectedBlog.excerpt}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 
import { Metadata } from 'next'
import { defaultMetadata } from './metadata'
import { Suspense } from "react"
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { serverDb, BlogPost } from '@/lib/firebase-server'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { BlogCard } from '@/components/blog/blog-card'

// Generate metadata for SEO
export const metadata: Metadata = defaultMetadata

async function getRecentPosts(limit: number = 8) {
  try {
    const posts = await serverDb.getBlogPosts({
      limit: limit,
      orderByField: 'publishedAt',
      orderDirection: 'desc',
      status: 'published'
    });
    
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getRecentPosts();

  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Blog Posts Grid */}
        <Suspense fallback={
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <div key={post.slug} className="flex justify-center p-4 bg-[#F1F1FF] backdrop-blur-sm rounded-3xl">
                  <BlogCard
                    title={post.title}
                    excerpt={post.excerpt}
                    publishedAt={post.publishedAt}
                    author={post.author}
                    slug={post.slug}
                    coverImage={post.coverImage}
                    readingTime={post.readingTime}
                    category={post.categories?.[0]}
                  />
                </div>
              ))}
            </div>
          </div>

          {posts.length === 0 && (
            <div className="text-center py-12 bg-white/90 backdrop-blur-xl rounded-xl border border-primary/10">
              <p className="text-lg text-muted-foreground">No blog posts found.</p>
              <Link href="/blog" className="text-primary hover:underline mt-2 inline-block">
                Visit our blog
              </Link>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link 
              href="/blog" 
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary hover:bg-primary/90 rounded-md shadow-sm transition-colors"
            >
              View All Posts
            </Link>
          </div>
        </Suspense>
      </div>
    </>
  )
}


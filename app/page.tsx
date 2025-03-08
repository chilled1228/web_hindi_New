import { Metadata } from 'next'
import { defaultMetadata } from './metadata'
import { Suspense } from "react"
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/lib/firebase-admin'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { BlogCard } from '@/components/blog/blog-card'

// Generate metadata for SEO
export const metadata: Metadata = defaultMetadata

interface BlogPost {
  title: string;
  excerpt: string;
  publishedAt: string;
  author: {
    name: string;
    image?: string;
  };
  categories: string[];
  tags: string[];
  slug: string;
  coverImage?: string;
  readingTime?: string;
}

async function getRecentPosts(limit: number = 8) {
  try {
    const query = db.collection('blog_posts').orderBy('publishedAt', 'desc').limit(limit);
    
    const postsRef = await query.get();
    const posts = postsRef.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        categories: data.categories || [],
        tags: data.tags || [],
        excerpt: data.excerpt || '',
        publishedAt: data.publishedAt?.toDate?.().toISOString() || new Date().toISOString(),
        slug: data.slug || doc.id
      } as BlogPost;
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
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Latest Blog Posts</h1>
          <p className="text-xl text-foreground max-w-2xl mx-auto">
            Discover insights, tips, and best practices for prompt engineering and working with AI language models.
          </p>
        </div>

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


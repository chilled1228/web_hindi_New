import { Metadata } from 'next'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { db } from '@/lib/firebase-admin'
import { BlogCard } from '@/components/blog/blog-card'

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

async function getAllPosts(searchParams?: { [key: string]: string | string[] | undefined }) {
  try {
    let query = db.collection('blog_posts').orderBy('publishedAt', 'desc');
    
    // Add category filter
    if (searchParams?.category) {
      query = query.where('categories', 'array-contains', searchParams.category);
    }
    
    // Add tag filter
    if (searchParams?.tag) {
      query = query.where('tags', 'array-contains', searchParams.tag);
    }

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

export const metadata: Metadata = {
  title: 'Blog | Prompt Engineering Insights',
  description: 'Explore our collection of articles about prompt engineering, AI tools, and best practices for working with language models.',
  openGraph: {
    title: 'Blog | Prompt Engineering Insights',
    description: 'Explore our collection of articles about prompt engineering, AI tools, and best practices for working with language models.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Prompt Engineering Insights',
    description: 'Explore our collection of articles about prompt engineering, AI tools, and best practices for working with language models.',
  },
  alternates: {
    types: {
      'application/rss+xml': 'https://freepromptbase.com/api/feed',
    }
  }
};

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="text-center mb-16">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Blog Posts</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Discover insights, tips, and best practices for prompt engineering and working with AI language models.
          </p>
          <Link 
            href="/api/feed"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rss"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
            RSS Feed
          </Link>
        </header>

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
          <div className="text-center py-12 bg-background/60 backdrop-blur-xl rounded-xl border border-primary/10">
            <p className="text-lg text-muted-foreground">No blog posts found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 
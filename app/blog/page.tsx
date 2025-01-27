import { Metadata } from 'next'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { db } from '@/lib/firebase-admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BlogPost {
  title: string;
  description: string;
  publishedAt: string;
  author: {
    name: string;
  };
  category?: string;
  difficulty?: number;
  slug: string;
  coverImage?: string;
}

async function getAllPosts(): Promise<BlogPost[]> {
  try {
    console.log('Fetching blog posts...');
    const postsRef = await db.collection('blog_posts')
      .orderBy('publishedAt', 'desc')
      .get()
      .catch(error => {
        console.error('Error in Firestore query:', error);
        throw error;
      });

    console.log(`Found ${postsRef.docs.length} blog posts`);
    
    // Track slugs to detect duplicates
    const slugs = new Set<string>();
    const posts = postsRef.docs.map(doc => {
      const data = doc.data();
      console.log('Processing post:', { id: doc.id, slug: data.slug });
      
      // If no slug exists, use the document ID
      const slug = data.slug || doc.id;
      
      // Check for duplicate slugs
      if (slugs.has(slug)) {
        console.error(`Duplicate slug found: ${slug}, using document ID as fallback`);
        // Use document ID as fallback
        data.slug = `${doc.id}-${Date.now()}`;
      } else {
        data.slug = slug;
        slugs.add(slug);
      }

      return {
        ...data,
        publishedAt: data.publishedAt?.toDate?.() 
          ? data.publishedAt.toDate().toISOString()
          : typeof data.publishedAt === 'string' 
            ? data.publishedAt 
            : new Date().toISOString(),
        slug: data.slug
      } as BlogPost;
    });

    // Log all slugs for debugging
    console.log('All post slugs:', posts.map(p => p.slug));
    
    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl dark:shadow-primary/5 hover:-translate-y-1 bg-background/60 dark:bg-gray-800/40 backdrop-blur-xl border-primary/10 dark:border-white/5">
                {post.coverImage && (
                  <div className="aspect-square relative bg-gradient-to-br from-background/80 to-muted/50 dark:from-gray-900/80 dark:to-gray-800/50 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <time dateTime={post.publishedAt} className="text-sm text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    {post.category && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground hover:bg-primary/20 transition-colors duration-300">
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-4">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-medium">{post.author.name}</span>
                    {post.difficulty && (
                      <span className="flex items-center gap-1">
                        {Array.from({ length: post.difficulty }).map((_, i) => (
                          <Star key={`${post.slug}-star-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
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
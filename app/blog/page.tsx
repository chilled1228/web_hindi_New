import { Metadata } from 'next'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { db } from '@/lib/firebase-admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"

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
    <div className="min-h-screen bg-transparent dark:bg-transparent py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover insights, tips, and best practices for prompt engineering and working with AI language models.
          </p>
          <div className="mt-4">
            <Link 
              href="/api/feed"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              RSS Feed
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="transition-transform hover:scale-[1.02]">
              <Card className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                {post.coverImage && (
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    {post.category && (
                      <>
                        <span>•</span>
                        <span>{post.category}</span>
                      </>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                  <CardDescription>{post.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{post.author.name}</span>
                  {post.difficulty && (
                    <span className="flex items-center gap-1">
                      {Array.from({ length: post.difficulty }).map((_, i) => (
                        <Star key={`${post.slug}-star-${i}`} className="w-4 h-4 fill-current text-yellow-500" />
                      ))}
                    </span>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No blog posts found.</p>
          </div>
        )}
      </div>
    </div>
  );
} 
import { Metadata } from 'next'
import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { serverDb, BlogPost } from '@/lib/firebase-server'
import { SchemaMarkup } from '@/components/schema-markup'
import { Breadcrumb } from '@/components/breadcrumb'
import { TableOfContents } from '@/components/table-of-contents/index'
import { CalendarDays, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Source_Sans_3 } from 'next/font/google'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { unstable_cache } from 'next/cache'

// Set static generation with ISR
export const revalidate = 3600; // Revalidate at most once per hour if not manually revalidated

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

interface RecentPost {
  title: string;
  slug: string;
  publishedAt: string;
  coverImage?: string;
}

// Cache the blog post with a tag for revalidation
const getCachedPost = unstable_cache(
  async (slug: string): Promise<BlogPost | null> => {
    try {
      const post = await serverDb.getBlogPostBySlug(slug);
      return post;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  },
  ['blog-post'],
  { tags: ['blogs', 'blog-post'] } // Use tags for targeted revalidation
);

async function getPost(slug: string): Promise<BlogPost | null> {
  return getCachedPost(slug);
}

// Cache recent posts with a tag for revalidation
const getCachedRecentPosts = unstable_cache(
  async (excludeSlug: string): Promise<RecentPost[]> => {
    try {
      const posts = await serverDb.getBlogPosts({
        limit: 3,
        orderByField: 'publishedAt',
        orderDirection: 'desc',
        status: 'published'
      });
      
      return posts
        .filter(post => post.slug !== excludeSlug)
        .slice(0, 3)
        .map(post => ({
          title: post.title,
          slug: post.slug,
          publishedAt: post.publishedAt,
          coverImage: post.coverImage
        }));
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      return [];
    }
  },
  ['recent-posts'],
  { tags: ['blogs'] } // Use tags for targeted revalidation
);

async function getRecentPosts(excludeSlug: string): Promise<RecentPost[]> {
  return getCachedRecentPosts(excludeSlug);
}

export async function generateStaticParams() {
  try {
    const posts = await serverDb.getBlogPosts({
      limit: 100,
      orderByField: 'publishedAt',
      orderDirection: 'desc',
      status: 'published'
    });
    
    return posts.map(post => ({
      slug: post.slug
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  const baseUrl = 'https://nayabharatyojana.in';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | NayaBharatYojana.in Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      url: postUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: postUrl
    }
  };
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);
  const recentPosts = await getRecentPosts(resolvedParams.slug);

  if (!post) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Post Not Found</h1>
        <p className="text-lg text-muted-foreground">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <div className="mt-8">
          <Link href="/blog" className="text-primary hover:underline">
            ← Back to all posts
          </Link>
        </div>
      </div>
    );
  }

  const safeContent = post.content || '';

  const baseUrl = 'https://nayabharatyojana.in';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="relative">
      <AnimatedBackground className="fixed inset-0 -z-10" />
      <div className="container mx-auto py-8 px-4">
        <Breadcrumb
          items={[
            { name: 'Home', url: '/' },
            { name: 'Blog', url: '/blog' },
            { name: post.title, url: `/blog/${post.slug}` },
          ]}
        />

        <article className="max-w-4xl mx-auto mt-8 bg-white/80 backdrop-blur-md rounded-xl p-6 md:p-10 shadow-lg">
          {post.coverImage && (
            <div className="relative w-full h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4" />
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </div>
              
              {post.readingTime && (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{post.readingTime} min read</span>
                </div>
              )}
              
              {post.author && (
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{post.author.name}</span>
                </div>
              )}
            </div>
            
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <Link href={`/blog?category=${category}`} key={category}>
                    <Badge variant="secondary">{category}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
            <div>
              <div 
                className={`prose prose-lg max-w-none ${sourceSans3.className}`}
                dangerouslySetInnerHTML={{ __html: safeContent }}
              />
            </div>
            
            <aside className="space-y-8">
              <TableOfContents 
                // @ts-ignore - Component expects content prop
                content={safeContent} 
              />
              
              {recentPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Posts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentPosts.map((recentPost) => (
                      <div key={recentPost.slug} className="flex items-start space-x-3">
                        {recentPost.coverImage && (
                          <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={recentPost.coverImage}
                              alt={recentPost.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <Link 
                            href={`/blog/${recentPost.slug}`}
                            className="font-medium hover:text-primary transition-colors line-clamp-2"
                          >
                            {recentPost.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(recentPost.publishedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </article>
      </div>
      
      <SchemaMarkup
        // @ts-ignore - Component expects these props
        title={post.title}
        description={post.description || post.excerpt || ''}
        datePublished={post.publishedAt}
        dateModified={post.updatedAt || post.publishedAt}
        authorName={post.author.name}
        imageUrl={post.coverImage}
        url={`${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post.slug}`}
      />
    </div>
  );
} 
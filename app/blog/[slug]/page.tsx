import { Metadata } from 'next'
import { Star, CalendarDays, Clock, Twitter, Facebook, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { serverDb, BlogPost } from '@/lib/firebase-server'
import { BlogPostSchema } from '@/components/client-schema'
import { Breadcrumb } from '@/components/breadcrumb'
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
        limit: 5,
        orderByField: 'publishedAt',
        orderDirection: 'desc',
        status: 'published'
      });
      
      return posts
        .filter(post => post.slug !== excludeSlug)
        .slice(0, 5)
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
      description: 'The blog post you are looking for does not exist or has been removed.'
    };
  }
  
  return {
    title: post.title,
    description: post.description || post.excerpt || `Read ${post.title} on our blog`,
    openGraph: {
      title: post.title,
      description: post.description || post.excerpt || `Read ${post.title} on our blog`,
      type: 'article',
      url: `/blog/${post.slug}`,
      images: post.coverImage ? [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ] : [],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author.name],
      tags: post.tags
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || post.excerpt || `Read ${post.title} on our blog`,
      images: post.coverImage ? [post.coverImage] : []
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nayabharatyojana.in';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Determine category color based on the first category
  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-400';
    
    const categoryMap: Record<string, string> = {
      'Travel': 'bg-purple-400',
      'Lifestyle': 'bg-teal-400',
      'Health': 'bg-green-400',
      'Technology': 'bg-blue-400',
      'Food': 'bg-amber-400',
      'Fashion': 'bg-pink-400'
    };
    
    return categoryMap[category] || 'bg-gray-400';
  };

  const categoryColor = getCategoryColor(post.categories?.[0]);

  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumb
          items={[
            { name: 'Home', url: '/' },
            { name: 'Blog', url: '/blog' },
            { name: post.title, url: `/blog/${post.slug}` },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 mt-8">
          {/* Main Content Section */}
          <div>
            {/* Blog Post Card */}
            <div className="bg-[#f4f1fb] md:rounded-xl overflow-hidden shadow-md">
              <div className="flex flex-col md:flex-row p-4 md:p-8 gap-6 md:gap-8">
                {/* Left: Featured Image Section */}
                <div className="w-full md:w-[300px] flex-shrink-0 mx-auto md:mx-0 max-w-[280px]">
                  <div className="relative aspect-square md:aspect-[6/7] rounded-xl overflow-hidden shadow-lg">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-6xl text-gray-300">✨</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right: Content Section */}
                <div className="flex-1 flex flex-col space-y-4 md:space-y-6">
                  <div className="flex flex-col space-y-3">
                    {/* Category Badge */}
                    {post.categories && post.categories.length > 0 && (
                      <div className="inline-flex items-center px-3 md:px-6 py-1 md:py-2 rounded-full bg-white shadow-sm w-fit">
                        <span className="text-xs md:text-sm font-medium text-gray-600">
                          {post.categories[0]}
                        </span>
                      </div>
                    )}

                    {/* Date and Reading Time */}
                    <div className="flex items-center text-xs md:text-sm text-gray-600">
                      <time dateTime={post.publishedAt} className="font-normal">
                        {formatDate(post.publishedAt)}
                      </time>
                      <span className="mx-2 md:mx-4 text-gray-400">•</span>
                      <span className="font-normal">{post.readingTime || '1'} min read</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="bg-white rounded-lg p-3 md:p-6 shadow-sm">
                    <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                      {post.title}
                    </h1>
                  </div>

                  {/* Author and Last Update */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto gap-3 sm:gap-0">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Avatar className="h-7 w-7 md:h-10 md:w-10">
                        <AvatarImage src={post.author?.avatar} alt={post.author?.name} />
                        <AvatarFallback>{post.author?.name?.charAt(0) || 'A'}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs md:text-base font-medium text-gray-700">{post.author?.name}</span>
                    </div>
                    <div className="text-xs md:text-sm text-gray-600">
                      Last Update: {formatDate(post.updatedAt?.toString() || post.publishedAt)}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Post Content */}
              <div className="px-4 md:px-8 pb-6 md:pb-8">
                <div className="pt-6 md:pt-8 border-t border-gray-100">
                  <div 
                    className={`prose prose-sm md:prose-base lg:prose-lg max-w-none ${sourceSans3.className} 
                      prose-headings:font-bold prose-headings:text-gray-800 prose-headings:mb-4
                      prose-h1:text-xl prose-h1:md:text-2xl prose-h1:leading-tight
                      prose-h2:text-lg prose-h2:md:text-xl prose-h2:leading-tight
                      prose-h3:text-base prose-h3:md:text-lg
                      prose-p:text-gray-700 prose-p:text-sm prose-p:md:text-base prose-p:leading-relaxed prose-p:my-3 md:prose-p:my-4
                      prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline 
                      prose-img:rounded-lg prose-img:my-4
                      prose-ul:pl-4 prose-ol:pl-4 prose-ul:my-3 prose-ol:my-3 md:prose-ul:my-4 md:prose-ol:my-4
                      prose-li:text-sm prose-li:md:text-base prose-li:my-1 md:prose-li:my-2
                      prose-pre:text-xs prose-pre:md:text-sm prose-pre:p-2 prose-pre:md:p-4 prose-pre:my-3 md:prose-pre:my-4
                      prose-code:text-xs prose-code:md:text-sm
                      prose-blockquote:text-sm prose-blockquote:md:text-base prose-blockquote:italic prose-blockquote:pl-3 prose-blockquote:border-l-2 prose-blockquote:border-gray-300 prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:my-3 md:prose-blockquote:my-4 prose-blockquote:rounded-sm
                    `}
                    dangerouslySetInnerHTML={{ __html: safeContent }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="mt-6 md:mt-8 space-y-4 md:space-y-6">
            {/* About Author Card */}
            <div className="p-4 md:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
              <div className="flex flex-col items-center">
                <h2 className="text-base md:text-xl font-bold mb-3 md:mb-4 text-center">About Me</h2>
                <div className="flex flex-col items-center mb-3 md:mb-4">
                  <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden mb-2 md:mb-3">
                    <Image
                      src={post.author?.avatar || '/images/default-avatar.png'}
                      alt={post.author?.name || 'Author'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-sm md:text-lg font-semibold text-gray-800">{post.author?.name}</h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">{post.author?.role || 'Writer'}</p>
                </div>
                <p className="text-xs md:text-base text-gray-700 leading-relaxed text-center max-w-prose">
                  I create content on various topics, and I offer live support via our ticket system.
                </p>
              </div>
            </div>

            {/* Recent Posts Card */}
            {recentPosts.length > 0 && (
              <div className="p-4 md:p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
                <h2 className="text-base md:text-xl font-bold mb-3 md:mb-4 text-center">Recent Posts</h2>
                <div className="space-y-2 md:space-y-4">
                  {recentPosts.map((recentPost, index) => (
                    <Link 
                      href={`/blog/${recentPost.slug}`}
                      key={recentPost.slug} 
                      className="block p-2 md:p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-2 md:space-x-3">
                        <div className="flex-shrink-0 relative">
                          {recentPost.coverImage ? (
                            <div className="relative w-12 h-14 md:w-16 md:h-20 rounded overflow-hidden">
                              <Image
                                src={recentPost.coverImage}
                                alt={recentPost.title}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute -left-1 -top-1 md:-left-2 md:-top-2 z-10 bg-white rounded-full w-4 h-4 md:w-6 md:h-6 flex items-center justify-center font-bold text-gray-700 text-[10px] md:text-xs shadow-sm ring-1 md:ring-2 ring-gray-100">
                                {index + 1}
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-12 h-14 md:w-16 md:h-20 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-lg md:text-2xl text-gray-400">✨</span>
                              <div className="absolute -left-1 -top-1 md:-left-2 md:-top-2 z-10 bg-white rounded-full w-4 h-4 md:w-6 md:h-6 flex items-center justify-center font-bold text-gray-700 text-[10px] md:text-xs shadow-sm ring-1 md:ring-2 ring-gray-100">
                                {index + 1}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <p className="font-medium line-clamp-2 text-xs md:text-sm">
                            {recentPost.title}
                          </p>
                          <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                            {formatDate(recentPost.publishedAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/blog" 
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary hover:bg-primary/90 rounded-md shadow-sm transition-colors"
          >
            Back to All Posts
          </Link>
        </div>
        
        <div className="mt-8 text-gray-700">
          Welcome, it's great to have you here.
        </div>
      </div>
      
      <BlogPostSchema
        title={post.title}
        description={post.description || post.excerpt || ''}
        datePublished={post.publishedAt}
        dateModified={typeof post.updatedAt === 'string' 
          ? post.updatedAt 
          : post.updatedAt && typeof (post.updatedAt as any).toDate === 'function'
            ? (post.updatedAt as any).toDate().toISOString()
            : post.updatedAt && (post.updatedAt as any)._seconds
              ? new Date((post.updatedAt as any)._seconds * 1000).toISOString()
              : post.publishedAt}
        authorName={post.author.name}
        imageUrl={post.coverImage}
        url={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://nayabharatyojana.in'}/blog/${post.slug}`}
      />
    </>
  );
} 
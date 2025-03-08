import { Metadata } from 'next'
import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from '@/lib/firebase-admin'
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

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

interface BlogPost {
  title: string;
  content: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: {
    name: string;
    role?: string;
    avatar?: string;
    bio?: string;
  };
  category?: string;
  difficulty?: number;
  slug: string;
  coverImage?: string;
  readingTime?: number;
}

interface RecentPost {
  title: string;
  slug: string;
  publishedAt: string;
  coverImage?: string;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const postRef = await db.collection('blog_posts').where('slug', '==', slug).limit(1).get();
    
    if (postRef.empty) {
      return null;
    }

    const postDoc = postRef.docs[0];
    const data = postDoc.data();

    return {
      ...data,
      publishedAt: data.publishedAt?.toDate?.() 
        ? data.publishedAt.toDate().toISOString()
        : typeof data.publishedAt === 'string' 
          ? data.publishedAt 
          : new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.() 
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt || data.publishedAt?.toDate?.().toISOString(),
      slug: data.slug,
      readingTime: data.readingTime || Math.ceil(data.content.split(' ').length / 200)
    } as BlogPost;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

async function getRecentPosts(excludeSlug: string): Promise<RecentPost[]> {
  try {
    const postsRef = await db.collection('blog_posts')
      .where('slug', '!=', excludeSlug)
      .orderBy('slug')
      .orderBy('publishedAt', 'desc')
      .limit(4)
      .get();
    
    return postsRef.docs.map((doc, index) => {
      const data = doc.data();
      return {
        title: data.title,
        slug: data.slug,
        publishedAt: data.publishedAt?.toDate?.() 
          ? data.publishedAt.toDate().toISOString()
          : typeof data.publishedAt === 'string' 
            ? data.publishedAt 
            : new Date().toISOString(),
        coverImage: data.coverImage
      };
    });
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const postsRef = await db.collection('blog_posts').get();
    return postsRef.docs.map(doc => ({
      slug: doc.data().slug
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

  const baseUrl = 'https://freepromptbase.com';
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | FreePromptBase Blog`,
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Post not found</p>
      </div>
    );
  }

  const baseUrl = 'https://freepromptbase.com';
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
    <>
      <AnimatedBackground />
      <SchemaMarkup type="BlogPosting" data={schema} />
      <div className={`relative z-10 min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${sourceSans3.className}`}>
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumb items={[
              { name: 'Home', url: '/' },
              { name: 'Blog', url: '/blog' },
              { name: post.title, url: `/blog/${post.slug}` }
            ]} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content - Single cohesive reading container */}
            <div className="lg:col-span-2">
              <div className="bg-[#F1F1FF] backdrop-blur-sm rounded-xl overflow-hidden shadow-lg mb-6 border-2 border-black">
                {/* Merged grid layout and content container */}
                <div className="p-6">
                  {/* Featured Post Header with image and content */}
                  <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 mb-6">
                    {/* Left side - Featured Image with vertical layout and black border */}
                    <div className="flex flex-col">
                      <div className="rounded-xl overflow-hidden border-2 border-black shadow-md bg-teal-500 h-[400px]">
                        {post.coverImage ? (
                          <Image 
                            src={post.coverImage} 
                            alt={post.title}
                            width={280}
                            height={400}
                            className="w-full h-full object-cover"
                            priority
                            style={{ aspectRatio: '2/3', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-gradient-to-br from-pink-400 to-pink-600">
                            <span className="text-black text-6xl font-bold">
                              {post.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Category badge moved below image */}
                      {post.category && (
                        <div className="mt-3 text-center">
                          <Link href={`/blog?category=${post.category}`}>
                            <Badge className="bg-teal-500/90 text-black hover:bg-teal-600/90 rounded-full px-4 py-1">
                              <span className="text-sm font-medium">{post.category}</span>
                            </Badge>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Right side - Title and metadata */}
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-3 text-sm text-black mb-3">
                        <span>{formatDate(post.publishedAt)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readingTime || 1} min read</span>
                        </div>
                      </div>
                      
                      <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4 border-2 border-black rounded-lg p-4 bg-white">
                        {post.title}
                      </h1>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <Avatar className="w-10 h-10 border border-black">
                          <AvatarImage src={post.author.avatar} alt={post.author.name} />
                          <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex justify-between w-full">
                          <div className="font-medium text-black">{post.author.name}</div>
                          <div className="text-sm text-black">Last Update: {formatDate(post.updatedAt || post.publishedAt)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Article content */}
                  
                  <p className="text-black text-lg mb-8">{post.description}</p>
                  
                  <div className="prose prose-zinc prose-black max-w-none text-black">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  </div>
                  
                  {/* Social Sharing */}
                  <div className="mt-8">
                    <div className="flex gap-4">
                      <button className="p-3 rounded-full bg-white hover:bg-gray-100 transition-colors border border-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-black">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                      </button>
                      <button className="p-3 rounded-full bg-white hover:bg-gray-100 transition-colors border border-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-black">
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                        </svg>
                      </button>
                      <button className="p-3 rounded-full bg-white hover:bg-gray-100 transition-colors border border-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-black">
                          <path d="M4 21v-7"></path>
                          <path d="M4 10V3"></path>
                          <path d="M12 21v-9"></path>
                          <path d="M12 8V3"></path>
                          <path d="M20 21v-5"></path>
                          <path d="M20 12V3"></path>
                          <path d="M1 14h6"></path>
                          <path d="M9 8h6"></path>
                          <path d="M17 16h6"></path>
                        </svg>
                      </button>
                      <button className="p-3 rounded-full bg-white hover:bg-gray-100 transition-colors border border-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-black">
                          <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white backdrop-blur-sm rounded-xl shadow-lg p-6 border-2 border-black">
                <p className="text-black">
                  Welcome, it's great to have you here.
                </p>
                
                <p className="mt-4 text-black">
                  We know that first impressions are important, so we've populated your new site with some
                  initial <span className="font-medium">getting started</span> posts that will help you get familiar with everything in no time.
                  This is the first one!
                </p>
                
                <h3 className="mt-6 font-semibold text-black">A few things you should know upfront:</h3>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-8">
              {/* About Me Card */}
              <div className="bg-yellow-50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border-2 border-black">
                <div className="px-6 py-4">
                  <h2 className="inline-block text-black font-semibold px-4 py-2 bg-white rounded-full mb-4 border border-black">About Me</h2>
                  
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4 border-2 border-black">
                      <AvatarImage src={post.author.avatar || "/images/placeholder-avatar.jpg"} alt={post.author.name} />
                      <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    
                    <h3 className="text-xl font-semibold text-black">{post.author.name}</h3>
                    <p className="text-black">{post.author.role || "Founder & Editor"}</p>
                    
                    <div className="flex gap-3 mt-3">
                      <a href="#" className="text-black hover:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                        </svg>
                      </a>
                      <a href="#" className="text-black hover:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                        </svg>
                      </a>
                      <a href="#" className="text-black hover:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                        </svg>
                      </a>
                    </div>
                    
                    <p className="mt-4 text-black text-sm">
                      Hello! My name is {post.author.name} working from Chile. I create some Ghost and Wordpress
                      themes for differents markets, also, I offer live support via our ticket system.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Recent Posts Card */}
              <Card className="bg-white backdrop-blur-sm shadow-lg border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-xl inline-block font-semibold px-4 py-2 bg-gray-100 rounded-full border border-black text-black">Recent Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {recentPosts.map((recentPost, index) => (
                    <Link href={`/blog/${recentPost.slug}`} key={recentPost.slug} className="block group">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-black">
                          {recentPost.coverImage ? (
                            <Image
                              src={recentPost.coverImage}
                              alt={recentPost.title}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-3xl font-bold text-black">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold flex gap-2 items-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-black font-bold text-xs border border-black">
                              {index + 1}
                            </span>
                            <h3 className="font-medium text-black group-hover:text-black transition-colors line-clamp-2">
                              {recentPost.title}
                            </h3>
                          </div>
                          <p className="text-xs text-black mt-1">
                            {formatDate(recentPost.publishedAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
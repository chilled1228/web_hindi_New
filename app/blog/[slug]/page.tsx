import { Metadata } from 'next'
import { Star } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { db } from '@/lib/firebase-admin'
import { SchemaMarkup } from '@/components/schema-markup'
import { Breadcrumb } from '@/components/breadcrumb'
import { TableOfContents } from '@/components/table-of-contents/index'

interface BlogPost {
  title: string;
  content: string;
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
      slug: data.slug
    } as BlogPost;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
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
    title: `${post.title} | Prompt Engineering Blog`,
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

export default async function BlogPost({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

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
    dateModified: post.publishedAt,
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl
    }
  };

  return (
    <>
      <SchemaMarkup type="BlogPosting" data={schema} />
      <div className="min-h-screen bg-transparent dark:bg-transparent py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[
            { name: 'Home', url: '/' },
            { name: 'Blog', url: '/blog' },
            { name: post.title, url: `/blog/${post.slug}` }
          ]} />
          
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,280px)_1fr] gap-4 lg:gap-8 mt-4">
            <aside className="hidden lg:block space-y-4 lg:space-y-8">
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <TableOfContents />
                </CardContent>
              </Card>
            </aside>

            <article className="prose prose-zinc dark:prose-invert max-w-none">
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 sm:px-8 lg:px-16 py-8 lg:py-16 border border-zinc-200 dark:border-zinc-800">
                {post.coverImage && (
                  <div className="relative w-full h-64 sm:h-80 lg:h-96 mb-8 overflow-hidden rounded-lg">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <header className="text-center mb-8 lg:mb-12">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">{post.title}</h1>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
                    <span>{post.author.name}</span>
                    <span>•</span>
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    {post.difficulty && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {Array.from({ length: post.difficulty }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground">{post.description}</p>
                </header>

                <div 
                  className="prose prose-zinc dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            </article>
          </div>
        </div>
      </div>
    </>
  );
} 
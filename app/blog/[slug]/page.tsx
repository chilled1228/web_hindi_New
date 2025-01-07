'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SchemaMarkup, generateBlogPostSchema } from '@/components/schema-markup';
import { Breadcrumb } from '@/components/breadcrumb';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { query, collection, where, getDocs } from 'firebase/firestore';

interface BlogPost {
  title: string;
  content: string;
  description: string;
  publishedAt: string;
  author: {
    name: string;
    avatar?: string;
  };
  coverImage?: string;
}

export default function BlogPost() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const q = query(
          collection(db, 'blog_posts'),
          where('slug', '==', params.slug)
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const postDoc = querySnapshot.docs[0];
          const data = postDoc.data();
          setPost({
            ...data,
            publishedAt: data.publishedAt?.toDate?.() 
              ? data.publishedAt.toDate().toISOString()
              : typeof data.publishedAt === 'string' 
                ? data.publishedAt 
                : new Date().toISOString()
          } as BlogPost);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchPost();
    }
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Post not found</p>
      </div>
    );
  }

  const websiteUrl = 'https://promptbase.com';
  const postUrl = `${websiteUrl}/blog/${params.slug}`;

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <SchemaMarkup
        type="BlogPosting"
        data={generateBlogPostSchema({
          ...post,
          url: postUrl
        })}
      />
      <Breadcrumb
        items={[
          { name: 'Blog', url: '/blog' },
          { name: post.title, url: postUrl }
        ]}
      />
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {post.author.avatar && (
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            )}
            <span>By {post.author.name}</span>
          </div>
          <span>•</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </div>
      </header>
      {post.coverImage && (
        <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
      <div 
        className="prose prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />
    </article>
  );
} 
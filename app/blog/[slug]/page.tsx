'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { SchemaMarkup, generateBlogPostSchema } from '@/components/schema-markup';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { TableOfContents } from '@/components/ui/table-of-contents';

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
}

export default function BlogPost() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

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
        <div className="animate-spin">Loading...</div>
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
    <div className="min-h-screen py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <SchemaMarkup
          type="BlogPosting"
          data={generateBlogPostSchema({
            ...post,
            url: postUrl
          })}
        />

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[15px] mb-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <span className="text-gray-400">»</span>
          <Link href="/blog" className="text-gray-600 hover:text-gray-900">
            Blog
          </Link>
          <span className="text-gray-400">»</span>
          <span className="text-gray-500">{post.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Left Sidebar */}
          <aside className="space-y-6">
            {/* Article Information Card */}
            <div className="bg-white rounded-[20px] p-6 border border-black/10">
              <h2 className="flex items-center gap-2 mb-6">
                <span className="text-pink-500 text-2xl">♦</span>
                <span className="text-lg font-semibold">Article Information</span>
              </h2>

              <div className="space-y-4">
                {/* Category */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Category:</p>
                    <p className="text-base font-medium">{post.category || 'CSS'}</p>
                  </div>
                </div>

                {/* Updated */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Updated:</p>
                    <p className="text-base font-medium">Mar 27, 2024</p>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Author:</p>
                    <p className="text-base font-medium">{post.author.name}</p>
                  </div>
                </div>

                {/* Reading time */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Reading time:</p>
                    <p className="text-base font-medium">1 Min</p>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Difficulty:</p>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= (post.difficulty || 3) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="bg-white rounded-[20px] border border-black/10">
              <TableOfContents contentRef={contentRef} />
            </div>
          </aside>

          {/* Main Content */}
          <main>
            <article className="bg-white rounded-[20px] p-8 border border-black/10">
              <div className="max-w-[800px] mx-auto mb-8">
                <h1 className="text-[40px] font-bold mb-6 tracking-tight leading-[1.2] max-w-[700px]">
                  {post.title}
                </h1>
                <div className="flex items-center gap-2 text-[15px] text-gray-500">
                  <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <span>Published:</span>
                  <time dateTime={post.publishedAt} className="text-gray-900 font-medium">
                    Jan 19, 2024
                  </time>
                </div>
              </div>

              <div className="max-w-[800px] mx-auto">
                <div className="text-gray-600 text-lg leading-relaxed mb-8">
                  {post.description}
                </div>

                <div 
                  ref={contentRef}
                  className="prose prose-lg max-w-none
                    prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight prose-headings:mb-4 
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:leading-tight
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:leading-tight
                    prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4 
                    prose-a:text-pink-500 hover:prose-a:text-pink-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 prose-strong:font-semibold
                    prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
                    prose-pre:bg-gray-900 prose-pre:rounded-lg prose-pre:p-4 prose-pre:my-4
                    prose-img:rounded-lg prose-img:my-6
                    prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-ul:marker:text-gray-400
                    prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                    prose-li:text-gray-600 prose-li:mb-2 prose-li:leading-relaxed
                    prose-blockquote:text-gray-600 prose-blockquote:border-l-4 prose-blockquote:border-pink-500 prose-blockquote:pl-4 prose-blockquote:my-4 prose-blockquote:leading-relaxed prose-blockquote:not-italic
                    prose-hr:my-8 prose-hr:border-gray-200
                    [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />
              </div>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
} 
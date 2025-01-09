'use client';

import { Star } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { SchemaMarkup, generateBlogPostSchema } from '@/components/schema-markup';
import { Breadcrumb } from '@/components/breadcrumb';

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

export default function ArticlePage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!contentRef.current || !tocRef.current || !post) return;

    const generateTOC = () => {
      const contentArea = contentRef.current;
      const tocContainer = tocRef.current;
      
      if (!contentArea || !tocContainer) return;

      // Find all h2 and h3 headings
      const headings = Array.from(contentArea.querySelectorAll('h2, h3'));
      if (headings.length === 0) return;

      // Create main list
      const mainList = document.createElement('ul');
      mainList.className = 'flex flex-col w-full';

      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.substring(1), 10) - 1;
        const id = heading.id || `section-${Math.random().toString(36).substr(2, 9)}`;
        heading.id = id;
        const text = heading.textContent || '';

        const li = document.createElement('li');
        li.className = 'relative group w-full';

        const a = document.createElement('a');
        a.href = `#${id}`;
        a.className = level === 1
          ? 'flex items-center text-[15px] text-gray-600 hover:text-[#6366F1] transition-colors py-2 relative block w-full break-words'
          : 'flex items-center text-[15px] text-gray-500 hover:text-[#6366F1] transition-colors pl-4 py-2 relative block w-full break-words';

        // Create active background element
        const activeBg = document.createElement('div');
        activeBg.className = 'absolute inset-0 bg-[#6366F1]/5 opacity-0 transition-opacity';
        a.appendChild(activeBg);

        // Create text container
        const textSpan = document.createElement('span');
        textSpan.className = 'relative z-10 w-full';
        textSpan.textContent = text;
        a.appendChild(textSpan);

        li.appendChild(a);
        mainList.appendChild(li);
      });

      // Clear previous TOC and append new one
      tocContainer.innerHTML = '';
      tocContainer.appendChild(mainList);

      // Add smooth scrolling
      mainList.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const link = target.closest('a');
        if (link) {
          event.preventDefault();
          const targetId = link.getAttribute('href')?.substring(1);
          if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
              window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
              });

              // Update active state
              const allLinks = mainList.querySelectorAll('a');
              allLinks.forEach(l => {
                const bg = l.querySelector('div');
                if (bg) bg.classList.add('opacity-0');
                l.classList.remove('text-[#6366F1]', 'font-medium');
              });
              const bg = link.querySelector('div');
              if (bg) bg.classList.remove('opacity-0');
              link.classList.add('text-[#6366F1]', 'font-medium');
            }
          }
        }
      });

      // Add scroll spy
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            const link = mainList.querySelector(`a[href="#${id}"]`);
            if (link) {
              const allLinks = mainList.querySelectorAll('a');
              allLinks.forEach(l => {
                const bg = l.querySelector('div');
                if (bg) bg.classList.add('opacity-0');
                l.classList.remove('text-[#6366F1]', 'font-medium');
              });
              const bg = link.querySelector('div');
              if (bg) bg.classList.remove('opacity-0');
              link.classList.add('text-[#6366F1]', 'font-medium');
            }
          }
        });
      }, {
        rootMargin: '-100px 0px -66%',
        threshold: 0
      });

      headings.forEach(heading => observer.observe(heading));
    };

    // Initial generation
    generateTOC();

    // Re-generate TOC when content changes
    const observer = new MutationObserver(generateTOC);
    observer.observe(contentRef.current, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, [post]);

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
    <div className="min-h-screen bg-transparent dark:bg-transparent py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8">
      <SchemaMarkup
        type="BlogPosting"
        data={generateBlogPostSchema({
          ...post,
          url: postUrl
        })}
      />
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(250px,280px)_1fr] gap-4 lg:gap-8">
          {/* Left Sidebar */}
          <div className="space-y-4 lg:space-y-8">
            <div className="hidden lg:block">
              <div className="fixed w-[250px] xl:w-[280px] space-y-4 lg:space-y-6">
                {/* Article Information */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 border border-zinc-200 dark:border-zinc-800">
                  <h2 className="flex items-center gap-2 font-semibold text-base lg:text-lg mb-4 lg:mb-6 text-zinc-900 dark:text-zinc-100">
                    <span className="text-indigo-500 dark:text-indigo-400">✦</span> Article Information
                  </h2>
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      <span className="text-sm font-medium">{post.category || 'CSS'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm">Updated: {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-sm">{post.author.name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span className="text-sm">2 min read</span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                      <span className="text-sm">Difficulty:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((star) => (
                          <Star 
                            key={star}
                            className={`w-4 h-4 ${star <= (post.difficulty || 3) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table of Contents */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 border border-zinc-200 dark:border-zinc-800">
                  <h2 className="flex items-center gap-2 font-semibold text-base lg:text-lg mb-4 lg:mb-6 text-zinc-900 dark:text-zinc-100">
                    <span className="text-indigo-500 dark:text-indigo-400">✦</span> Table of Contents
                  </h2>
                  <div ref={tocRef} className="relative w-full max-h-[calc(100vh-24rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Column */}
          <div className="space-y-4">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Breadcrumb
                items={[
                  { name: 'Blog', url: '/blog' },
                  { name: post.title, url: postUrl }
                ]}
              />
            </div>

            {/* Main Content Box */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl px-4 sm:px-8 lg:px-16 py-8 lg:py-16 border border-zinc-200 dark:border-zinc-800">
              <div className="text-center mb-8 lg:mb-12">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-zinc-900 dark:text-zinc-100 tracking-tight leading-[1.4] sm:leading-[1.4] max-w-2xl mx-auto">
                  {post.title}
                </h1>
                
                <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 mb-4 lg:mb-6">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm">Published: {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <div className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                  {post.description}
                </div>
              </div>

              <div 
                ref={contentRef}
                className="prose prose-base sm:prose-lg dark:prose-invert max-w-none
                  prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-headings:font-bold prose-headings:tracking-tight prose-headings:mb-6 lg:prose-headings:mb-8 
                  prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-12 lg:prose-h2:mt-16 prose-h2:leading-snug
                  prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-8 lg:prose-h3:mt-12 prose-h3:leading-snug
                  prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-7 prose-p:mb-5 lg:prose-p:mb-7 prose-p:text-base sm:prose-p:text-lg
                  prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-700 dark:hover:prose-a:text-indigo-300 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                  prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100 prose-strong:font-semibold
                  prose-code:text-zinc-800 dark:prose-code:text-zinc-200 prose-code:bg-zinc-100/80 dark:prose-code:bg-zinc-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-[14px] sm:prose-code:text-[15px] prose-code:before:content-[''] prose-code:after:content-['']
                  prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-800/90 prose-pre:rounded-xl prose-pre:p-4 sm:prose-pre:p-6 prose-pre:my-6 lg:prose-pre:my-8 prose-pre:shadow-lg prose-pre:overflow-x-auto
                  prose-img:rounded-xl prose-img:my-6 lg:prose-img:my-10 prose-img:shadow-lg prose-img:border prose-img:border-zinc-200 dark:prose-img:border-zinc-800 prose-img:max-w-full prose-img:h-auto
                  prose-ul:my-5 lg:prose-ul:my-7 prose-ul:list-disc prose-ul:pl-6 sm:prose-ul:pl-8 prose-ul:marker:text-zinc-500 dark:prose-ul:marker:text-zinc-400
                  prose-ol:my-5 lg:prose-ol:my-7 prose-ol:list-decimal prose-ol:pl-6 sm:prose-ol:pl-8
                  prose-li:text-zinc-600 dark:prose-li:text-zinc-400 prose-li:mb-2 lg:prose-li:mb-3 prose-li:leading-7 prose-li:text-base sm:prose-li:text-lg prose-li:pl-2
                  [&_ul]:list-disc [&_ul]:pl-4 sm:[&_ul]:pl-5 [&_ul>li]:mt-2
                  [&_ol]:list-decimal [&_ol]:pl-4 sm:[&_ol]:pl-5 [&_ol>li]:mt-2
                  prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400 prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 dark:prose-blockquote:border-indigo-400 prose-blockquote:pl-6 sm:prose-blockquote:pl-8 prose-blockquote:my-8 lg:prose-blockquote:my-10 prose-blockquote:leading-7 prose-blockquote:not-italic prose-blockquote:bg-zinc-50 dark:prose-blockquote:bg-zinc-900/50 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
                  prose-hr:my-12 lg:prose-hr:my-16 prose-hr:border-zinc-200 dark:prose-hr:border-zinc-800
                  [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                  selection:bg-indigo-100 dark:selection:bg-indigo-900/50"
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
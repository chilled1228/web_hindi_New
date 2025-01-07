'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { notFound, usePathname } from 'next/navigation';
import { TableOfContents } from '@/components/ui/table-of-contents';
import { cn } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  publishedAt: any;
  author: {
    name: string;
    avatar: string;
  };
  slug: string;
}

export default function BlogPostPage() {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const slug = pathname?.split('/').pop() || '';
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) {
        notFound();
        return;
      }

      try {
        const q = query(
          collection(db, 'blog_posts'),
          where('slug', '==', slug),
          where('status', '==', 'published')
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          notFound();
          return;
        }

        const postData = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        } as BlogPost;

        setPost(postData);
      } catch (error) {
        console.error('Error fetching post:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section with cover image */}
      {post.coverImage && (
        <div className="w-full h-[60vh] relative bg-black">
          <div className="absolute inset-0">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover opacity-80"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <article className={cn(
        "max-w-4xl mx-auto px-4 py-12",
        post.coverImage && "-mt-48 relative"
      )}>
        {/* Header section */}
        <header className={cn(
          "mb-12",
          post.coverImage && "text-white"
        )}>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-6 text-base">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium">{post.author.name}</div>
                <time className="text-sm opacity-80">
                  {formatDistanceToNow(post.publishedAt.toDate())} ago
                </time>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 sm:p-10">
          <TableOfContents contentRef={contentRef} defaultOpen={true} />
          
          <div 
            ref={contentRef}
            className="prose prose-lg dark:prose-invert max-w-none mt-8
              prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:text-gray-900 dark:prose-h1:text-white
              prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-12 prose-h2:text-gray-900 dark:prose-h2:text-white
              prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-gray-800 dark:prose-h3:text-gray-100
              prose-p:text-base prose-p:leading-7 prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:mb-6
              prose-ul:my-6 prose-ul:ml-6 prose-ul:list-disc prose-ul:text-gray-600 dark:prose-ul:text-gray-300
              prose-ol:my-6 prose-ol:ml-6 prose-ol:list-decimal prose-ol:text-gray-600 dark:prose-ol:text-gray-300
              prose-li:mb-2 prose-li:leading-7
              [&>*:first-child]:mt-0"
          >
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </div>
      </article>
    </div>
  );
} 
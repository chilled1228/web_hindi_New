'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { notFound, usePathname } from 'next/navigation';
import { TableOfContents } from '@/components/ui/table-of-contents';

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
      <article className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span>{post.author.name}</span>
            </div>
            <span>•</span>
            <time>{formatDistanceToNow(post.publishedAt.toDate())} ago</time>
          </div>
        </header>

        {post.coverImage && (
          <div className="relative aspect-[2/1] mb-8 rounded-lg overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <TableOfContents contentRef={contentRef} defaultOpen={true} />
        
        <div 
          ref={contentRef}
          className="prose prose-lg max-w-none mt-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
} 
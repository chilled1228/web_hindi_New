'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';

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

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const q = query(
          collection(db, 'blog_posts'),
          where('slug', '==', params.slug)
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
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [params.slug]);

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
    <article className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="w-full h-[40vh] sm:h-[50vh] relative">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 container mx-auto px-4 flex items-center justify-center">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div>
                <p className="font-medium">{post.author.name}</p>
                <p className="text-sm opacity-90">
                  {formatDistanceToNow(post.publishedAt.toDate(), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
    </article>
  );
} 
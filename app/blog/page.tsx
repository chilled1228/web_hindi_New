'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: {
    seconds: number;
    nanoseconds: number;
  };
  author: {
    name: string;
    image?: string;
  };
  slug: string;
  category: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);
        const q = query(collection(db, 'blog_posts'), orderBy('publishedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as BlogPost));
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setError('Failed to load blog posts. Please try again later.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const formatPublishedDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp?.seconds) return 'Recently';
    return formatDistanceToNow(new Date(timestamp.seconds * 1000));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-base">Loading blog posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-center text-destructive text-base">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-md transition-colors text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-muted-foreground text-base">No blog posts found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="w-full border-b border-border">
        <div className="container mx-auto px-4 py-24 max-w-5xl">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Image Prompt Tutorials
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Learn how to make AI draw anything you imagine
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Featured Post */}
        {posts.length > 0 && (
          <div className="mb-16">
            <Link
              href={`/blog/${posts[0].slug}`}
              className="group grid md:grid-cols-2 gap-8 p-6 rounded-xl border border-border hover:border-primary transition-colors"
            >
              <div className="relative aspect-[16/10] rounded-lg overflow-hidden">
                <img
                  src={posts[0].coverImage}
                  alt={posts[0].title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium border border-primary/30 text-primary px-4 py-1.5 rounded-full">
                    {posts[0].category}
                  </span>
                  <span className="text-sm text-muted-foreground">Featured</span>
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight group-hover:text-primary transition-colors">
                    {posts[0].title}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed line-clamp-3">
                    {posts[0].excerpt}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {posts[0].author.image && (
                    <img
                      src={posts[0].author.image}
                      alt={posts[0].author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{posts[0].author.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatPublishedDate(posts[0].publishedAt)} ago
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Grid of Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col border border-border hover:border-primary rounded-lg transition-colors overflow-hidden bg-card"
            >
              <div className="relative aspect-[16/10]">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              
              <div className="flex-1 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium border border-primary/30 text-primary px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatPublishedDate(post.publishedAt)} ago
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  {post.author.image && (
                    <img
                      src={post.author.image}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm">{post.author.name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 
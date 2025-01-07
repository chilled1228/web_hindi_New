'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [carouselIndex, setCarouselIndex] = useState(0);

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
        <p className="text-muted-foreground">Loading blog posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-center text-destructive">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-center text-muted-foreground">No blog posts found.</p>
      </div>
    );
  }

  const carouselPosts = posts.slice(0, 8);
  const mainPosts = posts.slice(8, 12);
  const popularPosts = posts.slice(12, 15);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Top Carousel */}
        <div className="relative mb-16">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out gap-6"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {carouselPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="min-w-[300px] w-[300px] flex-shrink-0"
                >
                  <div className="relative w-full aspect-[4/3] mb-4">
                    <div className="absolute inset-0 bg-gray-100 rounded-2xl overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 text-sm bg-red-500 text-white rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2 h-[3.5rem]">{post.title}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{formatPublishedDate(post.publishedAt)} ago</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <button
            onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg"
            disabled={carouselIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => setCarouselIndex(Math.min(carouselPosts.length - 4, carouselIndex + 1))}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg"
            disabled={carouselIndex >= carouselPosts.length - 4}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mainPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <div className="relative w-full aspect-[4/3] mb-4">
                    <div className="absolute inset-0 bg-gray-100 rounded-2xl overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 text-sm bg-red-500 text-white rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 h-[3.75rem]">{post.title}</h3>
                  <p className="text-gray-600 mb-3 line-clamp-2 h-[3rem]">{post.excerpt}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                        <img
                          src={post.author.image || '/default-avatar.png'}
                          alt={post.author.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm text-gray-500">{post.author.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatPublishedDate(post.publishedAt)} ago
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              <p className="text-gray-600 mb-4">
                Hello, We're content writers who are fascinated by content, fashion, celebrity and lifestyle.
                We help clients bring the right content to the right people.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                {/* Add other social icons here */}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">Popular Posts</h2>
              <div className="space-y-6">
                {popularPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex gap-4 items-start group"
                  >
                    <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold line-clamp-2 mb-1">{post.title}</h3>
                      <span className="text-sm text-gray-500 block">
                        {formatPublishedDate(post.publishedAt)} ago
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
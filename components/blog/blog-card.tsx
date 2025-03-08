'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface BlogCardProps {
  title: string;
  excerpt: string;
  publishedAt: string;
  author: {
    name: string;
    image?: string;
  };
  slug: string;
  coverImage?: string;
  readingTime?: string;
  category?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; hover: string }> = {
  'Travel': { bg: 'bg-purple-400', hover: 'hover:bg-purple-500' },
  'Lifestyle': { bg: 'bg-teal-400', hover: 'hover:bg-teal-500' },
  'Health': { bg: 'bg-green-400', hover: 'hover:bg-green-500' },
  'Technology': { bg: 'bg-blue-400', hover: 'hover:bg-blue-500' },
  'Food': { bg: 'bg-amber-400', hover: 'hover:bg-amber-500' },
  'Fashion': { bg: 'bg-pink-400', hover: 'hover:bg-pink-500' },
  'Default': { bg: 'bg-purple-400', hover: 'hover:bg-purple-500' },
};

export function BlogCard({
  title,
  excerpt,
  publishedAt,
  author,
  slug,
  coverImage,
  readingTime = "1 min read",
  category = "Travel"
}: BlogCardProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const { bg: bgColor } = CATEGORY_COLORS[category] || CATEGORY_COLORS['Default'];

  return (
    <div className="w-full">
      {/* Main Card */}
      <div className={`rounded-3xl overflow-hidden ${bgColor} transition-all duration-300`}>
        {/* Card Content */}
        <div className="relative" style={{ paddingBottom: '120%' }}> {/* Increased height - 6:5 aspect ratio */}
          {/* Category Badge */}
          <div className="absolute left-5 top-5 z-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 shadow-sm">
              <span className="text-sm font-medium text-gray-800">
                {category}
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="absolute right-5 top-5 z-10">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900/80 text-white"
            >
              <Moon size={16} />
            </button>
          </div>

          {/* Image Container */}
          {coverImage ? (
            <div className="absolute inset-0 w-full h-full">
              <img
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <span className="text-6xl text-white/70">✨</span>
            </div>
          )}

          {/* Title Box */}
          <div className="absolute left-0 right-0 bottom-6 px-5">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <h3 className="text-base font-semibold text-center text-gray-800">
                {title}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Content Below Card */}
      <div className="px-1">
        {/* Date and Reading Time */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
          <time dateTime={publishedAt}>{formattedDate}</time>
          <span>•</span>
          <span>{readingTime}</span>
        </div>

        {/* Excerpt */}
        <div className="mt-3">
          <p className="text-sm text-gray-600 text-center line-clamp-2">
            {excerpt}
          </p>
        </div>

        {/* Author and Action */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              {author.image ? (
                <img
                  src={author.image}
                  alt={author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {author.name.charAt(0)}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {author.name}
            </span>
          </div>

          <Link
            href={`/blog/${slug}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            Continue Reading
          </Link>
        </div>
      </div>
    </div>
  );
} 
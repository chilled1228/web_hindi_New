'use client';

import { useRef } from 'react';
import { TableOfContents } from '@/components/ui/table-of-contents';
import Image from 'next/image';

interface BlogPost {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    avatar: string;
  };
  readingTime?: string;
  // Other fields are optional for preview
  [key: string]: any;
}

interface PreviewProps {
  post: BlogPost;
}

export function Preview({ post }: PreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { title, content, coverImage, excerpt, author, readingTime } = post;

  return (
    <div className="max-w-4xl mx-auto">
      <article>
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        
        {author.name && (
          <div className="flex items-center mb-6">
            <div className="text-sm text-muted-foreground">
              By <span className="font-medium text-foreground">{author.name}</span>
              {readingTime && (
                <> · <span>{readingTime} read</span></>
              )}
            </div>
          </div>
        )}
        
        {excerpt && (
          <p className="text-xl text-muted-foreground mb-6 italic">{excerpt}</p>
        )}
        
        {coverImage && (
          <div className="w-full aspect-video relative rounded-lg overflow-hidden mb-8">
            <Image 
              src={coverImage}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <TableOfContents contentRef={contentRef} defaultOpen={true} />
        
        <div
          ref={contentRef}
          className="prose prose-sm sm:prose lg:prose-lg mx-auto mt-8"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </article>
    </div>
  );
} 
'use client';

import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { useState, useEffect } from 'react';

interface ImageProps extends Omit<NextImageProps, 'alt'> {
  alt: string;
  caption?: string;
  aboveTheFold?: boolean;
}

export function Image({ alt, caption, aboveTheFold = false, ...props }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(aboveTheFold);

  useEffect(() => {
    // Skip intersection observer for above-the-fold images
    if (aboveTheFold) return;

    // Use intersection observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' } // Start loading when image is 200px from viewport
    );

    const currentRef = document.getElementById(`image-${props.src}`);
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.disconnect();
    };
  }, [props.src, aboveTheFold]);

  return (
    <figure className="relative" id={`image-${props.src}`}>
      {(isIntersecting || aboveTheFold) && (
        <NextImage
          {...props}
          alt={alt}
          className={`w-full transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${props.className || ''}`}
          onLoad={() => setIsLoaded(true)}
          priority={aboveTheFold}
          loading={aboveTheFold ? 'eager' : 'lazy'}
          sizes={props.sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          quality={props.quality || 85}
        />
      )}
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// Helper function to generate descriptive alt text
export function generateAltText(context: {
  title?: string;
  description?: string;
  type?: string;
  position?: string;
}): string {
  const parts = [];

  if (context.title) {
    parts.push(context.title);
  }

  if (context.type) {
    parts.push(context.type);
  }

  if (context.description) {
    parts.push(context.description);
  }

  if (context.position) {
    parts.push(`positioned ${context.position}`);
  }

  return parts.join(' - ') || 'Image';
} 
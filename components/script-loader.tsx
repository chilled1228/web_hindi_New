'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface ScriptLoaderProps {
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
  src: string;
  id: string;
  onLoad?: () => void;
  defer?: boolean;
  async?: boolean;
}

/**
 * Optimized script loader component that intelligently loads scripts based on strategy
 * and user interaction to improve performance.
 */
export function ScriptLoader({
  strategy = 'afterInteractive',
  src,
  id,
  onLoad,
  defer = true,
  async = true,
}: ScriptLoaderProps) {
  const [shouldLoad, setShouldLoad] = useState(
    strategy === 'beforeInteractive' || strategy === 'afterInteractive'
  );

  useEffect(() => {
    if (strategy === 'lazyOnload' && !shouldLoad) {
      // For lazyOnload, we'll use Intersection Observer to load when visible
      // or when user interacts with the page
      
      // Create observer to detect when user scrolls near where script might be needed
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        { rootMargin: '200px' } // Load when within 200px of viewport
      );
      
      // Observe the body to detect scrolling
      observer.observe(document.body);
      
      // Also load on user interaction
      const handleUserInteraction = () => {
        setShouldLoad(true);
        cleanup();
      };
      
      // Add event listeners for user interaction
      document.addEventListener('scroll', handleUserInteraction, { once: true, passive: true });
      document.addEventListener('mousemove', handleUserInteraction, { once: true, passive: true });
      document.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true });
      document.addEventListener('click', handleUserInteraction, { once: true, passive: true });
      
      const cleanup = () => {
        observer.disconnect();
        document.removeEventListener('scroll', handleUserInteraction);
        document.removeEventListener('mousemove', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('click', handleUserInteraction);
      };
      
      return cleanup;
    }
  }, [strategy, shouldLoad]);

  // Don't render anything until we've determined we should load the script
  if (!shouldLoad) return null;

  return (
    <Script
      id={id}
      src={src}
      strategy={strategy === 'lazyOnload' ? 'afterInteractive' : strategy}
      onLoad={onLoad}
      defer={defer}
      async={async}
    />
  );
}

/**
 * Optimized analytics script loader that only loads analytics
 * after user interaction or when needed
 */
export function AnalyticsScriptLoader({
  src,
  id,
}: {
  src: string;
  id: string;
}) {
  return (
    <ScriptLoader
      src={src}
      id={id}
      strategy="lazyOnload"
      defer={true}
      async={true}
    />
  );
} 
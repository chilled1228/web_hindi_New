'use client';

import { useEffect } from 'react';
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

type WebVitalsMetric = {
  id: string;
  name: string;
  value: number;
  delta: number;
  entries: any[];
};

/**
 * Reports Web Vitals metrics to the specified endpoint or console
 */
const reportWebVitals = (metric: WebVitalsMetric) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vitals: ${metric.name} = ${metric.value}`);
    return;
  }

  // In production, send to analytics or monitoring service
  const body = {
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
  };

  // Use sendBeacon if available, otherwise use fetch
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', JSON.stringify(body));
  } else {
    fetch('/api/vitals', {
      body: JSON.stringify(body),
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((error) => {
      console.error('Error reporting Web Vitals:', error);
    });
  }
};

/**
 * Component that monitors and reports Web Vitals metrics
 * This should be included in the app layout or on important pages
 */
export function WebVitalsMonitor() {
  useEffect(() => {
    // Only measure web vitals in production
    if (process.env.NODE_ENV !== 'production') return;

    // Register metrics observers
    onCLS(reportWebVitals);
    onFID(reportWebVitals);
    onLCP(reportWebVitals);
    onFCP(reportWebVitals);
    onTTFB(reportWebVitals);
  }, []);

  // This component doesn't render anything
  return null;
}

/**
 * Helper function to get performance metrics for debugging
 */
export function logPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) return;

  setTimeout(() => {
    const perfEntries = window.performance.getEntriesByType('navigation');
    if (perfEntries.length > 0) {
      const timing = perfEntries[0] as PerformanceNavigationTiming;
      console.group('Performance Metrics');
      console.log(`DNS lookup: ${Math.round(timing.domainLookupEnd - timing.domainLookupStart)}ms`);
      console.log(`TCP connection: ${Math.round(timing.connectEnd - timing.connectStart)}ms`);
      console.log(`Request time: ${Math.round(timing.responseEnd - timing.requestStart)}ms`);
      console.log(`DOM interactive: ${Math.round(timing.domInteractive - timing.fetchStart)}ms`);
      console.log(`DOM complete: ${Math.round(timing.domComplete - timing.fetchStart)}ms`);
      console.log(`Load event: ${Math.round(timing.loadEventEnd - timing.loadEventStart)}ms`);
      console.log(`Total page load: ${Math.round(timing.loadEventEnd - timing.fetchStart)}ms`);
      console.groupEnd();
    }
  }, 0);
} 
import { useEffect, useState, useCallback } from 'react';

interface ReadingTimeProps {
  content: string;
  onTimeCalculated?: (time: string) => void;
}

export function ReadingTime({ content, onTimeCalculated }: ReadingTimeProps) {
  const [readingTime, setReadingTime] = useState('');

  const calculateReadingTime = useCallback(() => {
    // Remove HTML tags and trim whitespace
    const text = content.replace(/<[^>]*>/g, '').trim();
    
    // Count words (split by whitespace)
    const wordCount = text.split(/\s+/).length;
    
    // Average reading speed (words per minute)
    const wordsPerMinute = 200;
    
    // Calculate reading time in minutes
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    // Format the reading time string
    return `${minutes} min read`;
  }, [content]);

  useEffect(() => {
    const timeString = calculateReadingTime();
    if (timeString !== readingTime) {
      setReadingTime(timeString);
      if (onTimeCalculated) {
        onTimeCalculated(timeString);
      }
    }
  }, [content, calculateReadingTime, readingTime, onTimeCalculated]);

  return (
    <span className="text-sm text-muted-foreground">
      {readingTime || '0 min read'}
    </span>
  );
} 
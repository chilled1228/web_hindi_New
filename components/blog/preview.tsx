'use client';

import { useRef } from 'react';
import { TableOfContents } from '@/components/ui/table-of-contents';

interface PreviewProps {
  content: string;
}

export function Preview({ content }: PreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-4xl mx-auto">
      <TableOfContents contentRef={contentRef} defaultOpen={true} />
      <div
        ref={contentRef}
        className="prose prose-sm sm:prose lg:prose-lg mx-auto mt-8"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
} 
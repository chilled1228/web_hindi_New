'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PageProps {
  params: {
    action: string;
  };
  searchParams: Record<string, string | string[] | undefined>;
}

export default function BlogActionHandler({ params, searchParams }: PageProps) {
  const router = useRouter();
  const { action } = params;

  useEffect(() => {
    if (action === 'new') {
      const newDocRef = doc(collection(db, 'blog_posts'));
      router.push(`/admin/blog/edit/${newDocRef.id}`);
    }
  }, [action, router]);

  return null;
} 
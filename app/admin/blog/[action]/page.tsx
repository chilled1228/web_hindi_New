'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface BlogActionPageProps {
  params: {
    action: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function BlogActionHandler({
  params,
  searchParams,
}: BlogActionPageProps) {
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
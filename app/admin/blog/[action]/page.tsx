'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PageParams {
  action: string;
}

export default function BlogActionHandler({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params) as PageParams;
  const router = useRouter();
  const { action } = resolvedParams;

  useEffect(() => {
    if (action === 'new') {
      const newDocRef = doc(collection(db, 'blog_posts'));
      router.push(`/admin/blog/edit/${newDocRef.id}`);
    }
  }, [action, router]);

  return null;
} 
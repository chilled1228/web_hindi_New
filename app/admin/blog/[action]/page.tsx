'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BlogActionHandler({ params }: { params: { action: string } }) {
  const router = useRouter();

  useEffect(() => {
    if (params.action === 'new') {
      const newDocRef = doc(collection(db, 'blog_posts'));
      router.push(`/admin/blog/edit/${newDocRef.id}`);
    }
  }, [params.action, router]);

  return null;
} 
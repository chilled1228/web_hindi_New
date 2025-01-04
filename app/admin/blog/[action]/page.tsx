'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type BlogActionParams = {
  action: string;
};

type BlogActionSearchParams = {
  [key: string]: string | string[] | undefined;
};

export default function BlogActionHandler({
  params,
  searchParams,
}: {
  params: BlogActionParams;
  searchParams: BlogActionSearchParams;
}) {
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
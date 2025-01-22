'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BlogActionHandler() {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Extract action from pathname
    const action = pathname?.split('/').pop();
    
    if (action === 'new') {
      const newDocRef = doc(collection(db, 'blog_posts'));
      router.push(`/admin/blog/edit/${newDocRef.id}`);
    } else {
      // Redirect to admin dashboard if not a valid action
      router.push('/admin');
    }
  }, [pathname, router]);

  // Show loading or nothing while redirecting
  return null;
} 
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { AuthButtons } from '@/components/auth/auth-buttons';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || '/';
      router.push(redirectUrl);
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome to PromptBase</h1>
          <p className="text-muted-foreground">
            Sign in to access your prompts and history
          </p>
        </div>
        
        <div className="mt-8">
          <AuthButtons />
        </div>
      </div>
    </div>
  );
} 
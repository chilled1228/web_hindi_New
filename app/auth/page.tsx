'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { AuthButtons } from '@/components/auth/auth-buttons';
import { Loader2 } from 'lucide-react';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isPostLogout, setIsPostLogout] = useState(false);

  useEffect(() => {
    // Check if this is a post-logout navigation
    const isPostLogoutNav = document.referrer.includes('/admin');
    setIsPostLogout(isPostLogoutNav);

    // Clear any stale auth state on mount
    if (isPostLogoutNav) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('firebase:') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('firebase:') || key.includes('auth')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (user && !loading) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || '/';
      
      // Add a small delay for post-logout redirects
      if (isPostLogout) {
        setTimeout(() => {
          router.replace(redirectUrl);
        }, 100);
      } else {
        router.replace(redirectUrl);
      }
    }
  }, [user, loading, router, isPostLogout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

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
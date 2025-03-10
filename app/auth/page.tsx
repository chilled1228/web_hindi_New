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
    const isPostLogoutNav = Boolean(sessionStorage.getItem('isLoggingOut'));
    setIsPostLogout(isPostLogoutNav);

    // Clear any stale auth state on mount
    if (isPostLogoutNav) {
      // Clear the logging out flag
      sessionStorage.removeItem('isLoggingOut');
      
      // Clear any remaining auth state
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

      // Clear cookies
      const domains = [window.location.hostname, `.${window.location.hostname}`];
      const paths = ['/', '/admin', '/auth'];
      
      domains.forEach(domain => {
        paths.forEach(path => {
          document.cookie = `__session=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=${domain};`;
          document.cookie = `firebaseToken=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=${domain};`;
        });
      });

      // Force reload after cleanup to ensure fresh state
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    if (user && !loading) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || '/';
      router.replace(redirectUrl);
    }
  }, [user, loading, router]);

  if (loading || isPostLogout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {isPostLogout ? "Finalizing logout..." : "Checking authentication..."}
          </p>
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
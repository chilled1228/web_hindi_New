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
      // Get the redirect URL from query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || '/';
      
      // Force token refresh to ensure we have the latest authentication state
      user.getIdToken(true)
        .then(token => {
          // Update cookies with fresh token
          document.cookie = `firebaseToken=${token}; path=/`;
          document.cookie = `__session=${token}; path=/`;
          
          // Use window.location for a full page reload
          window.location.href = redirectUrl;
        })
        .catch(error => {
          console.error('Error refreshing token:', error);
          // Still try to redirect even if token refresh fails
          window.location.href = redirectUrl;
        });
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome to NayaBharatYojana.in</h1>
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
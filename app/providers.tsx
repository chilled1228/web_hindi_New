'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Toaster } from '@/components/ui/toaster';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [tabId] = useState(() => Math.random().toString(36).substring(2, 10));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Set a unique tab identifier in sessionStorage
    sessionStorage.setItem('tabId', tabId);
    
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        // Check if another tab has already initialized auth
        const existingAuth = localStorage.getItem('authInitialized');
        const now = Date.now();
        
        if (existingAuth) {
          const lastInit = parseInt(existingAuth, 10);
          // If auth was initialized in another tab within the last 5 seconds, wait for it
          if (now - lastInit < 5000) {
            console.log('Auth already being initialized in another tab');
            // Wait for the other tab to finish initializing
            setTimeout(() => {
              // Just check the current auth state without reinitializing
              const currentUser = auth ? auth.currentUser : null;
              setUser(currentUser);
              setLoading(false);
              setInitialized(true);
            }, 1000);
            return;
          }
        }
        
        // Mark that we're initializing auth
        localStorage.setItem('authInitialized', now.toString());
        
        // Set persistence to LOCAL - this ensures the user stays logged in
        if (auth) {
          await setPersistence(auth, browserLocalPersistence);
        } else {
          console.error('Auth is not initialized');
          setLoading(false);
          setInitialized(true);
          return;
        }
        
        // Listen for auth state changes
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              // Force token refresh to ensure we have a valid token
              await user.getIdToken(true);
              setUser(user);
              console.log('User authenticated:', user.email);
            } catch (error) {
              console.error('Error refreshing token:', error);
              setUser(null);
            }
          } else {
            console.log('No user authenticated');
            setUser(null);
          }
          setLoading(false);
          setInitialized(true);
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    // Add event listener for storage changes to handle auth state across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'firebase:authUser:' + process.env.NEXT_PUBLIC_FIREBASE_API_KEY + ':[DEFAULT]') {
        // Only reload if the auth state actually changed
        const newAuthState = event.newValue;
        const currentAuthState = user ? JSON.stringify(user) : null;
        
        // Check if we need to refresh by comparing auth states
        const needsRefresh = (newAuthState && !user) || (!newAuthState && user);
        
        if (needsRefresh) {
          // Auth state changed in another tab, reload the page to sync
          window.location.reload();
        }
      }
      
      // Handle tab coordination
      if (event.key === 'activeTab' && event.newValue !== tabId) {
        // Another tab became active, no need to refresh this one
        console.log('Another tab is now active');
      }
    };
    
    // Set this tab as active when focused
    const handleFocus = () => {
      localStorage.setItem('activeTab', tabId);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    // Set as active on initial load
    if (document.hasFocus()) {
      handleFocus();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [tabId, user]);

  // Don't render anything until we've initialized
  if (!initialized && typeof window !== 'undefined') {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Optimize page visibility handling
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // This tab is now visible, mark it as active
        localStorage.setItem('activeTab', sessionStorage.getItem('tabId') || '');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </NextThemeProvider>
  )
} 
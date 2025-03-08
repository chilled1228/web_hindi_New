'use client'

import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
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
        // Auth state changed in another tab, reload the page to sync
        window.location.reload();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
      </AuthProvider>
    </NextThemeProvider>
  )
} 
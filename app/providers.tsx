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
        await setPersistence(auth, browserLocalPersistence);
        console.log('Auth persistence set to LOCAL');
        
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
          if (user) {
            try {
              // Force token refresh
              await user.getIdToken(true);
              setUser(user);
            } catch (error) {
              console.error('Error refreshing token:', error);
              setUser(null);
            }
          } else {
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

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
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
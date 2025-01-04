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

  useEffect(() => {
    // Set persistence to LOCAL
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log('Auth persistence set to LOCAL');
      })
      .catch((error) => {
        console.error('Error setting auth persistence:', error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User logged in: ${user.email}` : 'User logged out');
      if (user) {
        // Force token refresh
        const token = await user.getIdToken(true);
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
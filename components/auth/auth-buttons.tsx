import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FcGoogle } from 'react-icons/fc';
import { MdEmail } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function AuthButtons() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSuccess = async (user: any) => {
    setIsLoading(false);
    setError('');
    
    try {
      // Get the token
      const token = await user.getIdToken(true);
      
      // Set the cookie with proper attributes for production
      const secure = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
      document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Lax; ${secure}`;
      
      // Get the redirect URL from query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || '/';
      
      // Use router.replace for navigation
      router.replace(redirectUrl);
    } catch (error) {
      console.error('Error setting authentication token:', error);
      setError('Failed to complete authentication. Please try again.');
    }
  };

  const getErrorMessage = (error: AuthError) => {
    console.error('Authentication error:', error);
    
    switch (error.code) {
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'Email already in use';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/popup-closed-by-user':
        return 'Sign in was cancelled';
      case 'auth/popup-blocked':
        return 'Sign in popup was blocked by your browser';
      case 'auth/cancelled-popup-request':
        return 'Sign in was cancelled';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is not enabled';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return error.message || 'An error occurred during authentication';
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!auth) {
      setError('Authentication service is not initialized');
      setIsLoading(false);
      return;
    }
    
    try {
      // Clear any existing auth state first
      document.cookie = '__session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'firebaseToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      await handleSuccess(userCredential.user);
    } catch (error: any) {
      setError(getErrorMessage(error));
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError('');
    
    if (!auth) {
      setError('Authentication service is not initialized');
      setIsLoading(false);
      return;
    }
    
    try {
      // Clear any existing auth state first
      document.cookie = '__session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'firebaseToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      
      // Always force account selection to avoid cached credentials
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      await handleSuccess(result.user);
    } catch (error: any) {
      setError(getErrorMessage(error));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="outline"
        onClick={signInWithGoogle}
        disabled={isLoading}
        className="relative flex items-center gap-2 h-11 hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <FcGoogle className="w-5 h-5" />
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          'Continue with Google'
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.form
          key={isSignUp ? 'signup' : 'signin'}
          initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleEmailAuth}
          className="space-y-4"
        >
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>
          
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-500 mt-2"
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 font-medium"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <MdEmail className="w-5 h-5" />
                {isSignUp ? 'Create Account' : 'Sign In'}
              </span>
            )}
          </Button>

          <p className="text-center text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </motion.form>
      </AnimatePresence>
    </div>
  );
} 
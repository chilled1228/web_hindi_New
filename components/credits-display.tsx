'use client';

import { useEffect, useState } from 'react';
import { Coins, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { auth, getUserCredits } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export function CreditsDisplay() {
  const [user] = useAuthState(auth);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    try {
      const userCredits = await getUserCredits(user.uid);
      setCredits(userCredits);
      setError(null);
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError('Failed to load credits');
    } finally {
      setLoading(false);
    }
  };

  // Fetch credits when user changes
  useEffect(() => {
    fetchCredits();
  }, [user]);

  // Fetch credits every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(fetchCredits, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Add event listener for credit updates
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCredits();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className="w-20">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (error) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive">
              Error
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{error}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Coins className="h-4 w-4" />
            <span>{credits}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Credits remaining</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 
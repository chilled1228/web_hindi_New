'use client'

import { useUser } from "@clerk/nextjs";

export function useAuth() {
  const { user, isLoaded } = useUser();
  
  // You can add more auth-related functionality here if needed
  return {
    user,
    isLoaded,
    // Since we're not using a database anymore, we'll return a default value
    promptsRemaining: 100, // or any other default value you want to set
    fetchUserData: () => {}, // Empty function since we're not fetching from DB anymore
  };
} 
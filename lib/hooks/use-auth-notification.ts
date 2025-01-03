import { useEffect } from 'react'
import { useAuth } from './use-auth'
import { useToast } from '@/components/ui/use-toast'
import { usePathname } from 'next/navigation'

export function useAuthNotification() {
  const { user, isLoaded } = useAuth()
  const { toast } = useToast()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoaded && !user && !pathname.includes('/sign-in') && !pathname.includes('/sign-up')) {
      toast({
        title: "Sign up required",
        description: "Please sign up or sign in to continue using this tool.",
        variant: "default",
      })
    }
  }, [isLoaded, user, pathname, toast])

  return { isAuthenticated: !!user }
} 
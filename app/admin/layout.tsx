'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useTheme } from 'next-themes'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useTheme()

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = auth?.currentUser
        if (!user || !db) {
          window.location.href = '/auth'
          return
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (!userDoc.exists() || !userDoc.data()?.isAdmin) {
          window.location.href = '/auth'
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error checking admin status:', error)
        window.location.href = '/auth'
      }
    }

    checkAdmin()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
} 
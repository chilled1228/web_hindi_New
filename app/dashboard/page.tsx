'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/app/providers'
import { LoginButton } from '@/components/auth/login-button'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Please login to access the dashboard</h1>
        <LoginButton />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6 dark:bg-gray-800">
        <h2 className="text-lg font-medium mb-4">Welcome, {user.email}</h2>
        <p className="text-gray-600 dark:text-gray-300">
          This is your personal dashboard. More features coming soon!
        </p>
      </div>
    </div>
  )
} 
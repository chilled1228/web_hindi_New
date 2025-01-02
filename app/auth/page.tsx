'use client'

import { useState } from 'react'
import { SignInForm } from '@/components/auth/sign-in'
import { SignUpForm } from '@/components/auth/sign-up'
import { useAuth } from '@/lib/auth-context'
import { redirect } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { user } = useAuth()

  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">
            {mode === 'signin' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'signin'
              ? 'Sign in to your account to continue'
              : 'Sign up for a new account'}
          </p>
        </div>

        {mode === 'signin' ? <SignInForm /> : <SignUpForm />}

        <div className="text-center">
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-sm text-primary hover:underline"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
} 
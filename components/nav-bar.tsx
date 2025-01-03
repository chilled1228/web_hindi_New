'use client'

import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/" 
              className="flex items-center px-2 text-xl font-semibold"
            >
              Blog App
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <SignedIn>
              <Link 
                href="/create" 
                className="text-sm font-medium hover:text-primary"
              >
                Create Post
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="text-sm font-medium hover:text-primary">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  )
} 
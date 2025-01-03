import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/lib/theme-provider'
import { Providers } from './providers'
import { NavigationMenu } from '@/components/navigation-menu'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true 
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </head>
        <body className={`${inter.className} antialiased min-h-screen`}>
          <Providers>
            <ThemeProvider>
              <NavigationMenu />
              <div className="flex justify-end items-center p-4 fixed top-0 right-0 z-50">
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
              <main className="pt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
              </main>
            </ThemeProvider>
          </Providers>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}


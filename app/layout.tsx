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

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <Providers>
            <ThemeProvider>
              <NavigationMenu />
              <div className="flex justify-end items-center p-4">
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/"/>
                </SignedIn>
              </div>
              <main className="pt-16">
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


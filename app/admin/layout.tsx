'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  X,
  Loader2,
  FileText,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Blog',
    href: '/admin/blog',
    icon: FileText
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const { theme, setTheme } = useTheme()

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth)
    }
    window.location.href = '/auth'
  }

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

        setUserName(user.displayName || '')
        setUserEmail(user.email || '')
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
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-64 bg-background border-r shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b">
                <div className="font-semibold text-lg mb-2">Admin Dashboard</div>
                <div className="text-sm text-muted-foreground">Manage your website content</div>
              </div>
              <nav className="flex flex-col h-full py-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-colors',
                      pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
                
                <div className="mt-auto border-t mx-2 pt-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start px-4 py-2.5 text-sm font-medium text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 border-r shadow-sm">
        <div className="p-4 border-b">
          <div className="font-semibold text-lg mb-2">Admin Dashboard</div>
          <div className="text-sm text-muted-foreground">Manage your website content</div>
        </div>
        <nav className="flex flex-col h-[calc(100vh-5rem)] py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-colors',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
          
          <div className="mt-auto border-t mx-2 pt-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start px-4 py-2.5 text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header bar */}
        <header className="h-16 border-b px-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {navigation.find(item => pathname.startsWith(item.href))?.name || 'Dashboard'}
          </h1>
          
          {/* User menu */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={auth?.currentUser?.photoURL || ""} alt={userName} />
                    <AvatarFallback>{userName ? userName.charAt(0).toUpperCase() : 'A'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{userName || 'Admin'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail || 'admin@example.com'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  )
} 
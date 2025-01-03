import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('__session')
  
  // List of paths that require authentication
  const protectedPaths = ['/dashboard', '/profile']
  
  // Check if the requested path is protected
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // If it's a protected path and user is not authenticated
  if (isProtectedPath && !authCookie) {
    // Redirect to auth page with the original URL as redirect parameter
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If it's the auth page and user is authenticated
  if (request.nextUrl.pathname === '/auth' && authCookie) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ (API routes)
     * 2. /_next/ (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)',
  ],
} 
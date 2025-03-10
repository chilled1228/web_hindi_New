'use client';

import Link from 'next/link';
import { LoginButton } from './auth/login-button';
import { Button } from './ui/button';
import { ChevronDown, Menu, Search, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { CreditsDisplay } from './credits-display';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef(false);
  const lastScrollY = useRef(0);

  // Add scroll event listener to track when user scrolls with optimized performance
  useEffect(() => {
    const handleScroll = () => {
      // Skip if we're already processing a scroll event
      if (scrollingRef.current) return;
      
      scrollingRef.current = true;
      
      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const isScrolled = currentScrollY > 10;
        
        // Only update state if the scroll position crossed our threshold
        if ((isScrolled && !scrolled) || (!isScrolled && scrolled)) {
          setScrolled(isScrolled);
        }
        
        lastScrollY.current = currentScrollY;
        scrollingRef.current = false;
      });
    };

    // Add event listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Calculate navbar height for the spacer
  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }
  }, []);

  return (
    <>
      {/* Spacer element to prevent content jump when navbar becomes fixed */}
      {scrolled && <div style={{ height: `${navHeight}px` }} />}
      
      <div 
        ref={navRef}
        className={`w-full ${
          scrolled 
            ? 'fixed top-0 left-0 right-0 z-50 py-0 shadow-md bg-white border-b border-gray-200 transform-gpu' 
            : 'relative py-8 bg-[#4ECDC4] transform-gpu'
        } transition-all duration-500 will-change-transform`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
        }}
      >
        {/* Container - changes from rounded to full-width when scrolled */}
        <div 
          className={`mx-auto ${
            scrolled 
              ? 'w-full container transform-gpu' 
              : 'w-[90%] max-w-6xl rounded-full bg-white overflow-hidden border border-black transform-gpu'
          } transition-all duration-500 will-change-transform`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo Section (Left) - distinct section */}
            <div className={`${scrolled ? 'py-3' : 'py-4'} px-6 ${!scrolled ? 'bg-[#fff] rounded-l-full' : ''} flex items-center transition-all duration-500`}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
              }}
            >
              <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
                <span className="font-heading text-3xl font-bold text-[#5c6bc0]">Hindi</span>
              </Link>
            </div>

            {/* Navigation Menu (Center) */}
            <div className="hidden md:flex flex-1 items-center justify-center px-4 transition-all duration-500"
              style={{
                transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
              }}
            >
              <div className="flex items-center space-x-4">
                <Link 
                  href="/"
                  className={`px-3 py-2 text-sm font-medium ${scrolled ? 'text-gray-800 hover:text-primary' : 'text-gray-700 hover:text-gray-900'} transition-all duration-300`}
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
                  }}
                >
                  Home
                </Link>
                
                <Link 
                  href="/about"
                  className={`px-3 py-2 text-sm font-medium ${scrolled ? 'text-gray-800 hover:text-primary' : 'text-gray-700 hover:text-gray-900'} transition-all duration-300`}
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
                  }}
                >
                  About
                </Link>
                
                <Link 
                  href="/blog"
                  className={`px-3 py-2 text-sm font-medium ${scrolled ? 'text-gray-800 hover:text-primary' : 'text-gray-700 hover:text-gray-900'} transition-all duration-300`}
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
                  }}
                >
                  Blog
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={`px-3 py-2 h-auto text-sm font-medium ${scrolled ? 'text-gray-800 hover:text-primary' : 'text-gray-700 hover:text-gray-900'} transition-all duration-300`}
                      style={{
                        transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
                      }}
                    >
                      <span>Categories</span>
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/categories/lifestyle">Lifestyle</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/categories/technology">Technology</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/categories/travel">Travel</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/categories/food">Food</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Link 
                  href="/featured"
                  className={`px-3 py-2 text-sm font-medium ${scrolled ? 'text-gray-800 hover:text-primary' : 'text-gray-700 hover:text-gray-900'} transition-all duration-300`}
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
                  }}
                >
                  Featured Posts
                </Link>
                
                <Link 
                  href="/contact"
                  className={`px-3 py-2 text-sm font-medium ${scrolled ? 'text-gray-800 hover:text-primary' : 'text-gray-700 hover:text-gray-900'} transition-all duration-300`}
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
                  }}
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Search & Social Icons (Right) */}
            <div className={`flex items-center justify-end ${scrolled ? 'py-3' : 'py-4 px-6'} space-x-4 transition-all duration-500`}
              style={{
                transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
              }}
            >
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-gray-900">
                <Search className="h-5 w-5" />
              </Button>
              
              <Link href="#" className="text-[#4267B2] hover:text-[#4267B2]/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </Link>
              
              <Link href="#" className="text-[#E1306C] hover:text-[#E1306C]/80">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="white"/>
                </svg>
              </Link>
              
              {/* Mobile Menu Button */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className={`h-9 w-9 ${scrolled ? 'text-gray-800' : 'text-gray-700'}`}>
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px] p-6 bg-white">
                  <div className="flex flex-col gap-4 mt-4">
                    <Link 
                      href="/"
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Home
                    </Link>
                    <Link 
                      href="/about"
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      About
                    </Link>
                    <Link 
                      href="/blog"
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Blog
                    </Link>
                    <div className="flex flex-col gap-2 pl-4">
                      <h3 className="text-lg font-medium">Categories</h3>
                      <Link 
                        href="/categories/lifestyle"
                        className="text-base text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Lifestyle
                      </Link>
                      <Link 
                        href="/categories/technology"
                        className="text-base text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Technology
                      </Link>
                      <Link 
                        href="/categories/travel"
                        className="text-base text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Travel
                      </Link>
                      <Link 
                        href="/categories/food"
                        className="text-base text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Food
                      </Link>
                    </div>
                    <Link 
                      href="/featured"
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Featured Posts
                    </Link>
                    <Link 
                      href="/contact"
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Contact
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
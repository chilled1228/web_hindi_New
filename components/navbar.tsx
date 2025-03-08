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
import { ModeToggle } from './mode-toggle';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { CreditsDisplay } from './credits-display';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full py-8 bg-[#4ECDC4]">
      {/* Outer rounded container */}
      <div className="w-[90%] max-w-6xl mx-auto rounded-full bg-white overflow-hidden border border-black">
        <div className="flex items-center">
          {/* Logo Section (Left) - distinct section */}
          <div className="py-4 px-6 bg-[#fff] rounded-l-full flex items-center">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
              <span className="font-heading text-3xl font-bold text-[#5c6bc0]">NBY</span>
            </Link>
          </div>

          {/* Navigation Menu (Center) */}
          <div className="hidden md:flex flex-1 items-center justify-center px-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Home
              </Link>
              
              <Link 
                href="/about"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                About
              </Link>
              
              <Link 
                href="/blog"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Blog
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 h-auto text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
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
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Featured Posts
              </Link>
              
              <Link 
                href="/contact"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Search & Social Icons (Right) */}
          <div className="flex items-center justify-end px-6 py-4 space-x-4">
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
                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-700">
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
  );
} 
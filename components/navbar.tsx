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
    <div className="w-full py-8">
      {/* Outer rounded container */}
      <div className="w-[90%] max-w-6xl mx-auto rounded-full bg-[#e9f5d0] overflow-hidden">
        <div className="flex items-center">
          {/* Logo Section (Left) - with distinct background */}
          <div className="bg-[#c9d7f0] py-4 px-6 rounded-l-full">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
              <span className="font-heading text-3xl font-bold text-[#5c6bc0]">groovy</span>
            </Link>
          </div>

          {/* Navigation Menu (Center) */}
          <div className="hidden md:flex flex-1 items-center justify-center px-4">
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 h-auto text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    <span>Home</span>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/">Home 1</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/home-2">Home 2</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 h-auto text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    <span>Header Styles</span>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/header-style-1">Style 1</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/header-style-2">Style 2</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 h-auto text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    <span>Post Features</span>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/post-feature-1">Feature 1</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/post-feature-2">Feature 2</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 h-auto text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    <span>#Tag</span>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/tag-1">Tag 1</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tag-2">Tag 2</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 h-auto text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    <span>Features</span>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/feature-1">Feature 1</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/feature-2">Feature 2</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-3 py-2 h-auto text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    <span>Shop</span>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/shop">All Products</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/shop/category">Categories</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
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
            
            <Link href="#" className="text-[#1DA1F2] hover:text-[#1DA1F2]/80">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
            </Link>
            
            <Link href="#" className="text-[#E1306C] hover:text-[#E1306C]/80">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="white"/>
              </svg>
            </Link>
            
            <Link href="#" className="text-[#ee802f] hover:text-[#ee802f]/80">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M4 11a9 9 0 0 1 9 9"/>
                <path d="M4 4a16 16 0 0 1 16 16"/>
                <circle cx="5" cy="19" r="1"/>
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
              <SheetContent side="right" className="w-[280px] sm:w-[350px] p-6">
                <div className="flex flex-col gap-4 mt-4">
                  <Link 
                    href="/"
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                  <div className="flex flex-col gap-2 pl-4">
                    <h3 className="text-lg font-medium">Header Styles</h3>
                    <Link 
                      href="/header-style-1"
                      className="text-base text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Style 1
                    </Link>
                    <Link 
                      href="/header-style-2"
                      className="text-base text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Style 2
                    </Link>
                  </div>
                  <div className="flex flex-col gap-2 pl-4">
                    <h3 className="text-lg font-medium">Post Features</h3>
                    <Link 
                      href="/post-feature-1"
                      className="text-base text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Feature 1
                    </Link>
                    <Link 
                      href="/post-feature-2"
                      className="text-base text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Feature 2
                    </Link>
                  </div>
                  <Link 
                    href="/tag"
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    #Tag
                  </Link>
                  <div className="flex flex-col gap-2 pl-4">
                    <h3 className="text-lg font-medium">Features</h3>
                    <Link 
                      href="/feature-1"
                      className="text-base text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Feature 1
                    </Link>
                    <Link 
                      href="/feature-2"
                      className="text-base text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Feature 2
                    </Link>
                  </div>
                  <div className="flex flex-col gap-2 pl-4">
                    <h3 className="text-lg font-medium">Shop</h3>
                    <Link 
                      href="/shop"
                      className="text-base text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      All Products
                    </Link>
                    <Link 
                      href="/shop/category"
                      className="text-base text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Categories
                    </Link>
                  </div>
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
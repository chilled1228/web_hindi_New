'use client';

import Link from 'next/link'
import { useState } from 'react'
import { Github, Twitter, Instagram, Linkedin, ArrowUpRight, Facebook, Youtube, ChevronRight } from 'lucide-react'

export function Footer() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Subscribing email:', email)
    // Reset form
    setEmail('')
    // Show success message or toast notification
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo and Social */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span key="footer-logo" className="font-heading text-xl font-bold text-gray-900">
                Hindi Blog
              </span>
            </Link>
            
            <p className="text-sm text-gray-600 max-w-xs">
              Latest information about government schemes and programs in India.
            </p>
            
            <div className="flex space-x-4">
              <Link 
                href="https://twitter.com/hindiblog" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              
              <Link 
                href="https://facebook.com/hindiblog" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              
              <Link 
                href="https://instagram.com/hindiblog" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              
              <Link 
                href="https://youtube.com/hindiblog" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="group flex items-center text-base text-gray-600 hover:text-gray-900 transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="group flex items-center text-base text-gray-600 hover:text-gray-900 transition-colors font-medium">
                  <ChevronRight className="h-4 w-4 mr-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="group flex items-center text-base text-gray-600 hover:text-gray-900 transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/categories/lifestyle" className="group flex items-center text-base text-gray-600 hover:text-gray-900 transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link href="/categories/technology" className="group flex items-center text-base text-gray-600 hover:text-gray-900 transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  Technology
                </Link>
              </li>
              <li>
                <Link href="/categories/travel" className="group flex items-center text-base text-gray-600 hover:text-gray-900 transition-colors">
                  <ChevronRight className="h-4 w-4 mr-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  Travel
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-gray-600 mb-4">
              Subscribe to our newsletter to get the latest updates.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500/50 transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:opacity-90 transition-opacity duration-200">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 order-2 md:order-1">
              © {new Date().getFullYear()} Hindi Blog. All rights reserved.
            </p>
            
            <div className="flex space-x-6 mb-4 md:mb-0 order-1 md:order-2">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="/disclaimer" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 
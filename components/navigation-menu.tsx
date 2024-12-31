'use client'

import Link from "next/link"
import { Search, Menu, X } from 'lucide-react'
import { useState } from "react"

export function NavigationMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 w-full h-[72px] border-b border-[#eaeaea] bg-white z-50">
      <div className="max-w-[1400px] h-full mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="font-medium text-[15px]">
          stability.ai
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {['Models', 'Applications', 'Deployment', 'Company', 'Docs'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-[14px] font-medium text-[#666666] hover:text-black transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 text-[14px] font-medium text-white bg-black rounded-full hover:bg-black/90 transition-colors">
              Contact Us
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`
          lg:hidden fixed inset-x-0 top-[72px] bg-white border-b border-[#eaeaea]
          transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
        `}>
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col gap-4">
            {['Models', 'Applications', 'Deployment', 'Company', 'Docs'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-[14px] font-medium text-[#666666] hover:text-black transition-colors py-2"
              >
                {item}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-4 border-t border-[#eaeaea]">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="flex-1 px-4 py-2 text-[14px] font-medium text-white bg-black rounded-full hover:bg-black/90 transition-colors">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}


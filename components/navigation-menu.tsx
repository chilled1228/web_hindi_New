'use client'

import Link from "next/link"
import { Search, Menu, X, Sun, Moon, Laptop2, BookOpen, Code2, Building2, FileCode2 } from 'lucide-react'
import { useState } from "react"
import { useTheme } from "@/lib/theme-provider"

export function NavigationMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { label: 'Models', icon: Code2 },
    { label: 'Applications', icon: Laptop2 },
    { label: 'Deployment', icon: FileCode2 },
    { label: 'Company', icon: Building2 },
    { label: 'Docs', icon: BookOpen },
  ]

  return (
    <nav className="fixed top-0 left-0 w-full h-[72px] border-b border-[#eaeaea] dark:border-gray-800 bg-white dark:bg-gray-900 z-50">
      <div className="max-w-[1400px] h-full mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="font-medium text-[15px] dark:text-white">
          Freepromptbase
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-5 h-5 dark:text-white" />
          ) : (
            <Menu className="w-5 h-5 dark:text-white" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8">
            {navItems.map(({ label, icon: Icon }) => (
              <Link
                key={label}
                href="#"
                className="text-[14px] font-medium text-[#666666] dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-white" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`
          lg:hidden fixed inset-x-0 top-[72px] bg-white dark:bg-gray-900 border-b border-[#eaeaea] dark:border-gray-800
          transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
        `}>
          <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col gap-4">
            {navItems.map(({ label, icon: Icon }) => (
              <Link
                key={label}
                href="#"
                className="text-[14px] font-medium text-[#666666] dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors py-2 flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-4 border-t border-[#eaeaea] dark:border-gray-800">
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}


'use client'

import Link from "next/link"
import { Search, Menu, X, Sun, Moon, ChevronDown } from 'lucide-react'
import { useState, useMemo, useCallback } from "react"
import { useTheme } from "@/lib/theme-provider"
import { AuthButton } from './auth-button'
import { usePathname } from 'next/navigation'

export function NavigationMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  const navItems = useMemo(() => [
    { label: 'Home', href: '/' },
    { label: 'Inspiration', href: '/inspiration' },
    { label: 'Tutorials', href: '/tutorials' },
    { 
      label: 'Tools',
      href: '#',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Image Generator', href: '/tools/image-generator' },
        { label: 'Prompt Builder', href: '/tools/prompt-builder' },
        { label: 'Style Guide', href: '/tools/style-guide' },
      ]
    },
    { label: 'Pricing', href: '/pricing' },
  ], [])

  const isActive = useCallback((href: string) => {
    if (href === '#') {
      return pathname.startsWith('/tools')
    }
    return pathname === href
  }, [pathname])

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  return (
    <nav className="fixed top-0 left-0 w-full h-16 border-b border-[#eaeaea] dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-[8px] z-50 shadow-sm will-change-transform">
      <div className="max-w-7xl h-full mx-auto px-4 sm:px-6 flex items-center justify-between transform translate-z-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-medium text-primary will-change-transform">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-sky-400"
            fill="currentColor"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-lg font-semibold tracking-tight">FreePromptBase</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <div key={item.label} className="relative group">
              <Link
                href={item.href}
                className={`flex items-center gap-1.5 text-[15px] font-medium transition-all duration-200 relative will-change-transform
                  ${isActive(item.href) 
                    ? 'text-primary' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white'
                  }
                  after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-primary
                  after:transition-all after:duration-200
                  ${isActive(item.href) ? 'after:w-full' : 'after:w-0 group-hover:after:w-full'}
                `}
              >
                {item.label}
                {item.hasDropdown && (
                  <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-200" />
                )}
              </Link>
              
              {item.hasDropdown && (
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 will-change-transform">
                  <div className="bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-lg shadow-black/5 dark:shadow-black/20 border border-gray-200/50 dark:border-gray-700/50 min-w-[220px] py-2 backdrop-blur-[8px] transform translate-z-0">
                    {item.dropdownItems?.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.label}
                        href={dropdownItem.href}
                        className={`block px-4 py-2.5 text-[14px] transition-colors duration-150
                          ${pathname === dropdownItem.href
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }
                        `}
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors duration-200"
          >
            {theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px] text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-[18px] h-[18px] text-gray-600" />
            )}
          </button>
          <AuthButton />
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          onClick={handleMenuToggle}
        >
          {isMenuOpen ? (
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white dark:bg-gray-900 z-40">
          <div className="p-4 space-y-3">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between py-2 text-[15px] transition-colors
                    ${isActive(item.href)
                      ? 'text-primary font-medium'
                      : 'text-gray-600 dark:text-gray-300'
                    }
                  `}
                  onClick={handleMenuToggle}
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </Link>
                {item.hasDropdown && (
                  <div className="pl-4 mt-1 space-y-1">
                    {item.dropdownItems?.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.label}
                        href={dropdownItem.href}
                        className={`block py-2 text-[14px] transition-colors
                          ${pathname === dropdownItem.href
                            ? 'text-primary'
                            : 'text-gray-500 dark:text-gray-400'
                          }
                        `}
                        onClick={handleMenuToggle}
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}


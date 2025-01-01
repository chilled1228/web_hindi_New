'use client'

import { useState } from "react"
import { useTheme } from "@/lib/theme-provider"
import Image from "next/image"
import Link from "next/link"

export function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-[72px] border-b border-[#eaeaea] dark:border-gray-800 bg-white dark:bg-gray-900 z-50">
        <div className="max-w-[1400px] h-full mx-auto px-6 flex items-center justify-between">
          <Link
            className="flex items-center justify-center gap-1 font-bold"
            href="/"
          >
            <Image
              src="/logo.png"
              width={32}
              height={32}
              alt="Logo"
              className="dark:hidden"
            />
            <Image
              src="/logo-dark.png"
              width={32}
              height={32}
              alt="Logo"
              className="hidden dark:block"
            />
            Freepromptbase
          </Link>
          {/* Rest of the navigation menu code */}
        </div>
      </nav>
    </>
  )
}


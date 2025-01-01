'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Settings, LogOut, LayoutDashboard } from 'lucide-react'

interface Props {
  children: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  const pathname = usePathname()

  return (
    <div className="flex">
      <aside className="w-64 bg-gray-100 border-r border-border">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                href="/posts"
                className={`flex items-center gap-2 p-3 hover:bg-gray-200 rounded-md ${
                  pathname === '/posts' ? 'bg-gray-200' : ''
                }`}
              >
                <FileText className="h-4 w-4" />
                Posts
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
} 
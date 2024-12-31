import Link from "next/link"
import { Search } from 'lucide-react'

export function NavigationMenu() {
  return (
    <nav className="h-[72px] border-b border-[#eaeaea]">
      <div className="max-w-[1400px] h-full mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="font-medium text-[15px]">
          stability.ai
        </Link>

        <div className="flex items-center gap-10">
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
      </div>
    </nav>
  )
}


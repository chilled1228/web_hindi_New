import Link from 'next/link'
import { Github, Twitter, Instagram, Linkedin, ArrowUpRight } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 left-1/4 w-72 h-72 bg-gray-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-gray-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 py-16">
        {/* Top Section with Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12 lg:gap-8">
          {/* Company Info - Spans 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gray-800 rounded-lg blur group-hover:blur-xl transition-all duration-300" />
                <svg viewBox="0 0 24 24" className="relative h-6 w-6 text-white" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="font-heading text-xl font-bold text-gray-900 dark:text-gray-100">
                FreePromptBase
              </span>
            </div>
            <p className="text-base text-muted-foreground/80 leading-relaxed max-w-sm">
              Revolutionizing AI prompt creation and management. Join our community of creators and innovators.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/promptbase"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://github.com/promptbase"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://instagram.com/promptbase"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://linkedin.com/company/promptbase"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Navigation Links - Each spans 1 column */}
          <div className="lg:col-span-1">
            <h3 className="text-base font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link 
                  href="/" 
                  className="group flex items-center text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Home
                  <ArrowUpRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="group flex items-center text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Blog
                  <ArrowUpRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="group flex items-center text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Pricing
                  <ArrowUpRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-base font-semibold mb-6">Tools</h3>
            <ul className="space-y-4">
              <li>
                <Link 
                  href="/tools/image-to-prompt" 
                  className="group flex items-center text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Image to Prompt
                  <ArrowUpRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/tools/text-to-prompt" 
                  className="group flex items-center text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Text to Prompt
                  <ArrowUpRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/tools/prompt-generator" 
                  className="group flex items-center text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Prompt Generator
                  <ArrowUpRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h3 className="text-base font-semibold mb-6">Legal</h3>
            <ul className="space-y-4">
              <li>
                <Link 
                  href="/privacy" 
                  className="group flex items-center text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Privacy Policy
                  <ArrowUpRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="group flex items-center text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Terms & Conditions
                  <ArrowUpRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="group flex items-center text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Contact Us
                  <ArrowUpRight className="h-4 w-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section - Spans 1 column */}
          <div className="lg:col-span-1">
            <h3 className="text-base font-semibold mb-6">Stay Updated</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Subscribe to our newsletter for the latest updates and AI prompt tips.
            </p>
            <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500/50 transition-all duration-200"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:opacity-90 transition-opacity duration-200"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 order-2 md:order-1">
              © {currentYear} FreePromptBase. All rights reserved.
            </p>
            <div className="flex items-center gap-8 order-1 md:order-2">
              <Link 
                href="/disclaimer" 
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 
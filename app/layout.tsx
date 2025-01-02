import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/lib/theme-provider'
import { Providers } from './providers'
import { NavBar } from '@/components/nav-bar'

const inter = Inter({ subsets: ['latin'] })

// Function to generate the favicon data URL
const generateFavicon = () => {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain"><path d="M12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/><path d="M12 8c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4z"/><path d="M12 12h.01"/></svg>`;
  const base64String = btoa(svgString);
  return `data:image/svg+xml;base64,${base64String}`;
};

export const metadata: Metadata = {
  title: 'Freepromptbase - Unlocking Human Potential With Generative AI',
  description: 'Developing and providing open-source AI models for creative problem-solving and industrial use.',
  icons: {
    icon: generateFavicon(),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <ThemeProvider>
            <NavBar />
            <main className="pt-16">
              {children}
            </main>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}


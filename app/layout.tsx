'use client';

import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/navbar'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import Head from 'next/head'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

interface WebsiteMetadata {
  title: string;
  description: string;
  keywords: string;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [metadata, setMetadata] = useState<WebsiteMetadata>({
    title: 'PromptBase',
    description: 'Your AI Prompt Management Tool',
    keywords: ''
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const metadataRef = doc(db, 'metadata', 'website');
        const metadataSnap = await getDoc(metadataRef);
        
        if (metadataSnap.exists()) {
          setMetadata(metadataSnap.data() as WebsiteMetadata);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-2 md:px-6 md:py-4">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}


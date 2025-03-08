'use client';

import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PrivacyConsent } from '@/components/privacy-consent'
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { SchemaMarkup, generateOrganizationSchema, generateWebsiteSchema } from '@/components/schema-markup'

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
    title: 'NayaBharatYojana.in',
    description: 'Revolutionizing AI prompt creation and management. Join our community of creators and innovators.',
    keywords: 'AI prompts, prompt generator, image to prompt, text to prompt, free AI tools'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch('/api/metadata');
        if (!response.ok) {
          throw new Error('Failed to fetch metadata');
        }
        const data = await response.json();
        setMetadata(data);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const websiteUrl = 'https://nayabharatyojana.in';

  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={websiteUrl} />
        <meta property="og:image" content={`${websiteUrl}/og-image.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={`${websiteUrl}/og-image.jpg`} />
        <link rel="canonical" href={websiteUrl} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <Providers>
          <SchemaMarkup
            type="Organization"
            data={generateOrganizationSchema({
              name: 'NayaBharatYojana.in',
              url: websiteUrl,
              logo: `${websiteUrl}/logo.png`,
              description: 'Revolutionizing AI prompt creation and management. Join our community of creators and innovators.',
              sameAs: [
                'https://twitter.com/nayabharatyojana',
                'https://github.com/nayabharatyojana',
                'https://instagram.com/nayabharatyojana',
                'https://linkedin.com/company/nayabharatyojana'
              ]
            })}
          />
          <SchemaMarkup
            type="WebSite"
            data={generateWebsiteSchema({
              name: 'NayaBharatYojana.in',
              url: websiteUrl,
              description: metadata.description,
              potentialAction: [{
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${websiteUrl}/search?q={search_term_string}`
                },
                'query-input': 'required name=search_term_string'
              }]
            })}
          />
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-2 md:px-6 md:py-4">
              {children}
            </main>
            <Footer />
            <PrivacyConsent />
          </div>
        </Providers>
      </body>
    </html>
  )
}


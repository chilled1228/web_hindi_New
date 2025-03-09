import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PrivacyConsent } from '@/components/privacy-consent'
import { ClientSchemas } from '@/components/client-schema'
import { db } from '@/lib/firebase-admin'
import { Firestore } from 'firebase-admin/firestore'
import { WebVitalsMonitor } from '@/components/web-vitals'
import NextTopLoader from 'nextjs-toploader'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  preload: true,
})

interface WebsiteMetadata {
  title: string;
  description: string;
  keywords: string;
}

const defaultMetadata: WebsiteMetadata = {
  title: 'Naya Bharat Yojana',
  description: 'Latest information about government schemes and programs in India.',
  keywords: 'government schemes, yojana, india, government programs, welfare schemes'
};

const METADATA_CACHE_TIME = 60 * 60 * 1000;
let cachedMetadata: WebsiteMetadata | null = null;
let lastFetchTime = 0;

async function getMetadata(): Promise<WebsiteMetadata> {
  const now = Date.now();
  
  if (cachedMetadata && now - lastFetchTime < METADATA_CACHE_TIME) {
    return cachedMetadata;
  }
  
  try {
    const metadataRef = await (db as Firestore)
      .collection('metadata')
      .doc('website')
      .get();
    
    if (!metadataRef.exists) {
      cachedMetadata = defaultMetadata;
    } else {
      cachedMetadata = metadataRef.data() as WebsiteMetadata;
    }
    
    lastFetchTime = now;
    return cachedMetadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return defaultMetadata;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const metadata = await getMetadata();
  const websiteUrl = 'https://nayabharatyojana.in';

  return (
    <html lang="en">
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
        
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link rel="preconnect" href="https://storage.googleapis.com" />
        
        <link rel="preload" href="/og-image.jpg" as="image" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <Providers>
          <NextTopLoader 
            color="#2563eb"
            initialPosition={0.08}
            height={6}
            showSpinner={false}
            shadow="0 0 10px #2563eb,0 0 5px #2563eb"
          />
          <ClientSchemas 
            key="site-schemas"
            websiteUrl={websiteUrl}
            title={metadata.title}
            description={metadata.description}
          />
          <WebVitalsMonitor />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
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


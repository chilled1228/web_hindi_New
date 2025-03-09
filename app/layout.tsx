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

const defaultMetadata: WebsiteMetadata = {
  title: 'Naya Bharat Yojana',
  description: 'Latest information about government schemes and programs in India.',
  keywords: 'government schemes, yojana, india, government programs, welfare schemes'
};

async function getMetadata(): Promise<WebsiteMetadata> {
  try {
    const metadataRef = await (db as Firestore)
      .collection('metadata')
      .doc('website')
      .get();
    
    if (!metadataRef.exists) {
      return defaultMetadata;
    }

    return metadataRef.data() as WebsiteMetadata;
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
          <ClientSchemas 
            key="site-schemas"
            websiteUrl={websiteUrl}
            title={metadata.title}
            description={metadata.description}
          />
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


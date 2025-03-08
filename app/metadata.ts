import { Metadata } from 'next'

export const defaultMetadata: Metadata = {
  title: 'NayaBharatYojana.in - Insights on Prompt Engineering and AI Tools',
  description: 'Discover insights, tips, and best practices for prompt engineering and working with AI language models through our collection of blog posts.',
  keywords: ['AI blog', 'prompt engineering', 'AI tools', 'language models', 'AI tutorials'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nayabharatyojana.in',
    siteName: 'NayaBharatYojana.in',
    title: 'NayaBharatYojana.in - Insights on Prompt Engineering and AI Tools',
    description: 'Discover insights, tips, and best practices for prompt engineering and working with AI language models through our collection of blog posts.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NayaBharatYojana.in',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NayaBharatYojana.in - Insights on Prompt Engineering and AI Tools',
    description: 'Discover insights, tips, and best practices for prompt engineering and working with AI language models through our collection of blog posts.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
} 
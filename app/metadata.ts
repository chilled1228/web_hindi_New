import { Metadata } from 'next'

export const defaultMetadata: Metadata = {
  title: 'Free AI Prompts - High Quality Prompts for Your Projects',
  description: 'Discover and use high-quality AI prompts for your projects. Free collection of prompts for various AI models and use cases.',
  keywords: ['AI prompts', 'free prompts', 'prompt engineering', 'AI tools', 'prompt templates'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://freepromptbase.com',
    siteName: 'Free AI Prompts',
    title: 'Free AI Prompts - High Quality Prompts for Your Projects',
    description: 'Discover and use high-quality AI prompts for your projects. Free collection of prompts for various AI models and use cases.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Free AI Prompts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Prompts - High Quality Prompts for Your Projects',
    description: 'Discover and use high-quality AI prompts for your projects. Free collection of prompts for various AI models and use cases.',
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
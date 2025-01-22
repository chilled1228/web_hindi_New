import { MetadataRoute } from 'next'
import { db } from '@/lib/firebase-admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all prompts
  const promptsSnapshot = await db.collection('prompts').get()
  
  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://freepromptbase.com'

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  // Dynamic prompt routes
  const promptRoutes = promptsSnapshot.docs.map((doc) => ({
    url: `${baseUrl}/prompts/${doc.id}`,
    lastModified: new Date(doc.data().createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...routes, ...promptRoutes]
} 
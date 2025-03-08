import { MetadataRoute } from 'next'
import { db } from '@/lib/firebase-admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all prompts and blog posts
  const [promptsSnapshot, blogsSnapshot] = await Promise.all([
    db.collection('prompts').get(),
    db.collection('blogs').get()
  ])
  
  // Base URL from environment variable or default
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nayabharatyojana.in'

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]

  // Dynamic prompt routes
  const promptRoutes = promptsSnapshot.docs.map((doc) => ({
    url: `${baseUrl}/prompts/${doc.id}`,
    lastModified: new Date(doc.data().createdAt),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  // Dynamic blog routes
  const blogRoutes = blogsSnapshot.docs.map((doc) => ({
    url: `${baseUrl}/blog/${doc.id}`,
    lastModified: new Date(doc.data().createdAt),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [...routes, ...promptRoutes, ...blogRoutes]
} 
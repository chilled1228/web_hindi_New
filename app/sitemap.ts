import { MetadataRoute } from 'next'
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://freepromptbase.com'

  // Get all blog posts
  const blogSnapshot = await getDocs(collection(db, 'blogs'))
  const blogUrls = blogSnapshot.docs.map((doc) => ({
    url: `${baseUrl}/blog/${doc.id}`,
    lastModified: new Date(doc.data().updatedAt?.toDate() || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Static routes
  const routes = [
    '',
    '/blog',
    '/disclaimer',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }))

  return [...routes, ...blogUrls]
} 
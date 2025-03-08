import { db } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Get all blog posts
    const postsRef = await db.collection('blog_posts')
      .orderBy('publishedAt', 'desc')
      .get();

    const posts = postsRef.docs.map(doc => ({
      slug: doc.data().slug,
      updatedAt: doc.data().publishedAt?.toDate?.() 
        ? doc.data().publishedAt.toDate().toISOString()
        : new Date().toISOString()
    }));

    // Base URL
    const baseUrl = 'https://nayabharatyojana.in';

    // Create XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/text-humanizer</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/backstory</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Blog posts -->
  ${posts.map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

    // Return the XML sitemap
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
} 
import { db } from '@/lib/firebase-admin'

interface BlogPost {
  title: string;
  content: string;
  description: string;
  publishedAt: string;
  author: {
    name: string;
  };
  category?: string;
  slug: string;
}

export async function GET() {
  try {
    const postsRef = await db.collection('blog_posts')
      .orderBy('publishedAt', 'desc')
      .get();

    const posts = postsRef.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        publishedAt: data.publishedAt?.toDate?.() 
          ? data.publishedAt.toDate().toISOString()
          : new Date().toISOString(),
      } as BlogPost;
    });

    const baseUrl = 'https://nayabharatyojana.in';
    const feedUrl = `${baseUrl}/api/feed`;

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Prompt Engineering Blog</title>
    <link>${baseUrl}</link>
    <description>Discover insights, tips, and best practices for prompt engineering and working with AI language models.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <author>${post.author.name}</author>
      ${post.category ? `<category>${post.category}</category>` : ''}
    </item>`).join('')}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
} 
import { useEffect } from 'react';

interface SchemaMarkupProps {
  type: 'Organization' | 'WebSite' | 'BlogPosting' | 'BreadcrumbList';
  data: any;
}

export function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  useEffect(() => {
    // Create the schema script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    });

    // Add the script to the document head
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(script);
    };
  }, [type, data]);

  return null;
}

// Helper function to generate breadcrumb schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@id': item.url,
        name: item.name,
      },
    })),
  };
}

// Helper function to generate blog post schema
export function generateBlogPostSchema(post: {
  title: string;
  description: string;
  publishedAt: string;
  author: { name: string };
  url: string;
  image?: string;
}) {
  return {
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    datePublished: post.publishedAt,
    image: post.image,
    url: post.url,
  };
}

// Helper function to generate organization schema
export function generateOrganizationSchema(org: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}) {
  return {
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    logo: org.logo,
    description: org.description,
    sameAs: org.sameAs,
  };
}

// Helper function to generate website schema
export function generateWebsiteSchema(site: {
  name: string;
  url: string;
  description: string;
  potentialAction?: Array<{
    '@type': string;
    target: {
      '@type': string;
      urlTemplate: string;
    };
    'query-input': string;
  }>;
}) {
  return {
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    description: site.description,
    potentialAction: site.potentialAction,
  };
} 
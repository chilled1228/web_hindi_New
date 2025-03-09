'use client';

import { useEffect, useState } from 'react';

interface SchemaMarkupProps {
  type: 'Organization' | 'WebSite' | 'BlogPosting' | 'BreadcrumbList';
  data: Record<string, any>;
}

export function SchemaMarkup({ type, data }: SchemaMarkupProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BlogPostSchemaInput {
  title: string;
  description: string;
  publishedAt: string;
  author: { name: string };
  url: string;
  image?: string;
}

export function generateBlogPostSchema(post: BlogPostSchemaInput) {
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

// Client component that can be used in server components
export function SiteSchemas({ 
  websiteUrl, 
  title, 
  description 
}: { 
  websiteUrl: string; 
  title: string; 
  description: string;
}) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  return (
    <>
      <SchemaMarkup
        type="Organization"
        data={generateOrganizationSchema({
          name: 'FreePromptBase',
          url: websiteUrl,
          logo: `${websiteUrl}/logo.png`,
          description: 'Revolutionizing AI prompt creation and management. Join our community of creators and innovators.',
          sameAs: [
            'https://twitter.com/freepromptbase',
            'https://github.com/freepromptbase',
            'https://instagram.com/freepromptbase',
            'https://linkedin.com/company/freepromptbase'
          ]
        })}
      />
      <SchemaMarkup
        type="WebSite"
        data={generateWebsiteSchema({
          name: title,
          description: description,
          url: websiteUrl
        })}
      />
    </>
  );
} 
'use client';

import { useEffect, useState } from 'react';

interface SchemaData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

function SchemaScript({ data }: { data: SchemaData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ClientSchemas({ 
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
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Naya Bharat Yojana',
    url: websiteUrl,
    logo: `${websiteUrl}/logo.png`,
    description: 'Latest information about government schemes and programs in India.',
    sameAs: [
      'https://twitter.com/nayabharatyojana',
      'https://instagram.com/nayabharatyojana',
      'https://facebook.com/nayabharatyojana'
    ]
  };
  
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: title,
    url: websiteUrl,
    description: description
  };
  
  return (
    <>
      <SchemaScript data={organizationSchema} />
      <SchemaScript data={websiteSchema} />
    </>
  );
}

export function BreadcrumbSchema({ 
  items 
}: { 
  items: { name: string; url: string }[] 
}) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
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
  
  return <SchemaScript data={breadcrumbSchema} />;
}

export function BlogPostSchema({ 
  title,
  description,
  datePublished,
  dateModified,
  authorName,
  imageUrl,
  url
}: { 
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  imageUrl?: string;
  url: string;
}) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  const blogPostSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    image: imageUrl,
    url: url,
  };
  
  return <SchemaScript data={blogPostSchema} />;
} 
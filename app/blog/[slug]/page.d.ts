import { Metadata } from 'next';

declare module '*.tsx' {
  interface PageProps {
    params: { slug: string };
    searchParams?: { [key: string]: string | string[] | undefined };
  }

  export { PageProps };
}

export {}; 
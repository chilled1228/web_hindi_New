import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { BreadcrumbSchema } from './client-schema';

interface BreadcrumbProps {
  items: {
    name: string;
    url: string;
  }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <>
      <BreadcrumbSchema items={items} />
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-sm text-black">
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-black" />}
              {index === items.length - 1 ? (
                <span className="text-black font-medium">{item.name}</span>
              ) : (
                <Link
                  href={item.url}
                  className="text-black hover:text-black/80 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
} 
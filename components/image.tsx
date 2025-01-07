import NextImage, { ImageProps as NextImageProps } from 'next/image';

interface ImageProps extends Omit<NextImageProps, 'alt'> {
  alt: string;
  caption?: string;
}

export function Image({ alt, caption, ...props }: ImageProps) {
  return (
    <figure className="relative">
      <NextImage
        {...props}
        alt={alt}
        className={`w-full ${props.className || ''}`}
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// Helper function to generate descriptive alt text
export function generateAltText(context: {
  title?: string;
  description?: string;
  type?: string;
  position?: string;
}): string {
  const parts = [];

  if (context.title) {
    parts.push(context.title);
  }

  if (context.type) {
    parts.push(context.type);
  }

  if (context.description) {
    parts.push(context.description);
  }

  if (context.position) {
    parts.push(`positioned ${context.position}`);
  }

  return parts.join(' - ') || 'Image';
} 
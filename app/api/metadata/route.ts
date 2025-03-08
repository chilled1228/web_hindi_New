import { db } from '@/lib/firebase-admin';
import { Firestore } from 'firebase-admin/firestore';

interface WebsiteMetadata {
  title: string;
  description: string;
  keywords: string;
}

const defaultMetadata: WebsiteMetadata = {
  title: 'NayaBharatYojana.in',
  description: 'Revolutionizing AI prompt creation and management. Join our community of creators and innovators.',
  keywords: 'AI prompts, prompt generator, image to prompt, text to prompt, free AI tools'
};

export async function GET() {
  try {
    const metadataRef = await (db as Firestore)
      .collection('metadata')
      .doc('website')
      .get();
    
    if (!metadataRef.exists) {
      // Return default metadata if document doesn't exist
      return Response.json(defaultMetadata);
    }

    return Response.json(metadataRef.data() as WebsiteMetadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return new Response('Error fetching metadata', { status: 500 });
  }
} 
import { db } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const metadataRef = await db.collection('metadata').doc('website').get();
    
    if (!metadataRef.exists) {
      // Return default metadata if document doesn't exist
      return Response.json({
        title: 'FreePromptBase',
        description: 'Revolutionizing AI prompt creation and management. Join our community of creators and innovators.',
        keywords: 'AI prompts, prompt generator, image to prompt, text to prompt, free AI tools'
      });
    }

    return Response.json(metadataRef.data());
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return new Response('Error fetching metadata', { status: 500 });
  }
} 
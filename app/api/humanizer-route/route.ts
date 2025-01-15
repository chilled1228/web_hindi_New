import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert at making text sound more natural and human-like. Rewrite the given text to make it more conversational and engaging while maintaining the original meaning."
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "gpt-3.5-turbo",
    });

    const humanizedText = completion.choices[0].message.content;

    // Store in Firestore
    await db.collection('humanized_texts').add({
      originalText: text,
      humanizedText,
      createdAt: new Date(),
    });

    return NextResponse.json({ humanizedText });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to humanize text' }, { status: 500 });
  }
} 
import { db } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a creative writer specializing in character backstories. Create engaging, detailed character backstories based on the user's prompt. Include personality traits, motivations, and key life events."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
    });

    const backstory = completion.choices[0].message.content;

    // Store in Firestore
    await db.collection('backstories').add({
      prompt,
      backstory,
      createdAt: new Date(),
    });

    return NextResponse.json({ backstory });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate backstory' }, { status: 500 });
  }
} 
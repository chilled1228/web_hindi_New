import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from '@/lib/firebase-admin';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate the backstory
    const result = await model.generateContent(`Create a compelling character backstory based on this prompt: ${prompt}
        
    Please write a detailed, engaging backstory that incorporates all elements while maintaining consistency and emotional depth. The backstory should be well-structured, approximately 2-3 paragraphs long.`);

    const response = await result.response;
    const backstory = response.text();

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
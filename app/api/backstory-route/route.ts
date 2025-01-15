import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from '@/lib/firebase-admin';
import { Firestore } from 'firebase-admin/firestore';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Save to Firestore
    await (db as Firestore)
      .collection('backstories')
      .add({
        prompt,
        response: text,
        createdAt: new Date().toISOString()
      });

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error generating backstory:', error);
    return NextResponse.json({ error: 'Failed to generate backstory' }, { status: 500 });
  }
} 
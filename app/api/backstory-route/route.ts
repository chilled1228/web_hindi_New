import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase-admin";
import { getFirestore } from 'firebase-admin/firestore';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const db = getFirestore(adminApp);

async function getUserCredits(userId: string): Promise<number> {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data();
    if (!userData) {
      throw new Error('User data is empty');
    }

    // Check for daily credit refresh
    const lastRefresh = userData.lastCreditRefresh ? new Date(userData.lastCreditRefresh) : null;
    const now = new Date();

    // If never refreshed or last refresh was more than 24 hours ago
    if (!lastRefresh || (now.getTime() - lastRefresh.getTime() > 24 * 60 * 60 * 1000)) {
      await db.collection('users').doc(userId).update({
        credits: 10, // Default credits
        lastCreditRefresh: now.toISOString(),
      });
      return 10;
    }

    return userData.credits || 0;
  } catch (error) {
    console.error('Error getting user credits:', error);
    throw error;
  }
}

async function updateUserCredits(userId: string, newCredits: number) {
  try {
    if (newCredits < 0) {
      throw new Error('Credits cannot be negative');
    }
    await db.collection('users').doc(userId).update({
      credits: newCredits,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user credits:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: string;

    try {
      const decodedToken = await getAuth(adminApp).verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check user credits
    const credits = await getUserCredits(userId);
    if (credits < 1) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
    }

    // Parse request body
    const { characterName, setting, keyEvents } = await req.json();

    if (!characterName || !setting || !keyEvents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate backstory using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Create a compelling character backstory with the following details:
    Character Name: ${characterName}
    Setting: ${setting}
    Key Life Events: ${keyEvents}
    
    Please write a detailed, engaging backstory that incorporates all these elements while maintaining consistency and emotional depth. The backstory should be well-structured, approximately 2-3 paragraphs long, and MUST start with the word "In" (e.g., "In the bustling streets of..." or "In the ancient kingdom of...").`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let backstory = response.text();

    // Ensure the backstory starts with "In"
    if (!backstory.startsWith("In")) {
      backstory = "In " + backstory;
    }

    // Update user credits
    await updateUserCredits(userId, credits - 1);

    return NextResponse.json({ backstory });
  } catch (error) {
    console.error('Error in backstory generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate backstory' },
      { status: 500 }
    );
  }
} 
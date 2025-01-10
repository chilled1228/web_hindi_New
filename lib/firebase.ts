import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, onAuthStateChanged, User } from 'firebase/auth';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBzz4VJ_jUKGKuEVIcg06hCdwAMQ3wpx0c",
  authDomain: "promptbase-68406.firebaseapp.com",
  projectId: "promptbase-68406",
  storageBucket: "promptbase-68406.firebasestorage.app",
  messagingSenderId: "402680075602",
  appId: "1:402680075602:web:8005555645a6fb148ad68b",
  measurementId: "G-DKGK53ML37"
};

// Initialize Firebase
let app;
try {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize Auth with error handling
const auth = getAuth(app);

// Initialize Firestore with error handling
const db = getFirestore(app);

// Initialize Analytics only in browser
let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error('Error initializing Analytics:', error);
  }
}

// Initialize Storage
const storage = getStorage(app);

// Single auth state listener with error handling
auth.onAuthStateChanged(async (user) => {
  try {
    if (user) {
      await initializeUserCredits(user);
    }
  } catch (error) {
    console.error('Error in auth state change:', error);
  }
});

// Credit management functions
export const DEFAULT_CREDITS = 10;

export async function refreshDailyCredits(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return;
    }

    const userData = userDoc.data();
    if (!userData) {
      return;
    }

    const lastRefresh = userData.lastCreditRefresh ? new Date(userData.lastCreditRefresh) : null;
    const now = new Date();

    // If never refreshed or last refresh was more than 24 hours ago
    if (!lastRefresh || (now.getTime() - lastRefresh.getTime() > 24 * 60 * 60 * 1000)) {
      await updateDoc(userRef, {
        credits: DEFAULT_CREDITS,
        lastCreditRefresh: now.toISOString(),
      });
      console.log('Daily credits refreshed for user:', userId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing daily credits:', error);
    throw error;
  }
}

export async function initializeUserCredits(user: User) {
  if (!user) return;
  
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: user.email,
        credits: DEFAULT_CREDITS,
        createdAt: new Date().toISOString(),
        lastCreditRefresh: new Date().toISOString(),
        isAdmin: false, // Default to non-admin
      });
      console.log('Initialized credits for new user:', user.uid);
    }
  } catch (error) {
    console.error('Error initializing user credits:', error);
    throw error;
  }
}

export async function getUserCredits(userId: string): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.warn('User document not found:', userId);
      return 0;
    }
    
    // Check and refresh daily credits before returning
    await refreshDailyCredits(userId);
    
    // Get the latest user document after potential refresh
    const updatedDoc = await getDoc(userRef);
    const userData = updatedDoc.data();
    if (!userData) {
      return 0;
    }
    return userData.credits || 0;
  } catch (error) {
    console.error('Error getting user credits:', error);
    throw error;
  }
}

export async function updateUserCredits(userId: string, newCredits: number) {
  try {
    if (newCredits < 0) {
      throw new Error('Credits cannot be negative');
    }
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      credits: newCredits,
      lastUpdated: new Date().toISOString(),
    });
    
    console.log('Updated credits for user:', userId, 'New credits:', newCredits);
  } catch (error) {
    console.error('Error updating user credits:', error);
    throw error;
  }
}

export { app, auth, db, analytics, storage }; 
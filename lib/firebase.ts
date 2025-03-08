import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc, updateDoc, Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase config using environment variables with fallbacks to hardcoded values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCZ1ANouWH3dvVXlqo4bSjtLMbaJigSEJE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hinidiblog.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hinidiblog",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "hinidiblog.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "773076236040",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:773076236040:web:9c33e47fc6349e2a245ebd",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-PXG47XZWF1"
};

// Debug logging for Firebase config
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Not Set',
  authDomain: firebaseConfig.authDomain ? 'Set' : 'Not Set',
  projectId: firebaseConfig.projectId ? 'Set' : 'Not Set',
  storageBucket: firebaseConfig.storageBucket ? 'Set' : 'Not Set',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Set' : 'Not Set',
  appId: firebaseConfig.appId ? 'Set' : 'Not Set',
  measurementId: firebaseConfig.measurementId ? 'Set' : 'Not Set'
});

// Check if all required config values are present
const isConfigValid = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.authDomain && 
         firebaseConfig.projectId && 
         firebaseConfig.storageBucket && 
         firebaseConfig.messagingSenderId && 
         firebaseConfig.appId;
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let analytics: Analytics | undefined;
let storage: FirebaseStorage | undefined;

try {
  if (isConfigValid()) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    console.log('Firebase initialized with project ID:', firebaseConfig.projectId);
    
    // Initialize Auth with error handling
    auth = getAuth(app);
    console.log('Firebase Auth initialized');
    
    // Initialize Firestore with error handling
    db = getFirestore(app);
    
    // Initialize Analytics only in browser
    if (typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
      } catch (error) {
        console.error('Error initializing Analytics:', error);
      }
    }
    
    // Initialize Storage
    storage = getStorage(app);
  } else {
    console.error('Invalid Firebase configuration. Some required fields are missing.');
    console.error('Config:', {
      apiKey: !!firebaseConfig.apiKey,
      authDomain: !!firebaseConfig.authDomain,
      projectId: !!firebaseConfig.projectId,
      storageBucket: !!firebaseConfig.storageBucket,
      messagingSenderId: !!firebaseConfig.messagingSenderId,
      appId: !!firebaseConfig.appId
    });
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Credit management functions
export const DEFAULT_CREDITS = 10;

export async function refreshDailyCredits(userId: string) {
  if (!db) {
    console.error('Firestore not initialized');
    return false;
  }
  
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    if (!userData) {
      return false;
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
  if (!user || !db) {
    console.error('User or Firestore not initialized');
    return;
  }
  
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
  if (!db) {
    console.error('Firestore not initialized');
    return 0;
  }
  
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
  if (!db) {
    console.error('Firestore not initialized');
    return;
  }
  
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

// Single auth state listener with error handling
if (auth) {
  auth.onAuthStateChanged(async (user) => {
    try {
      if (user) {
        await initializeUserCredits(user);
      }
    } catch (error) {
      console.error('Error in auth state change:', error);
    }
  });
}

export { app, auth, db, analytics, storage }; 
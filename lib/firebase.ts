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
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize Auth with error handling
const auth = getAuth(app);
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
});

// Initialize Firestore with error handling
const db = getFirestore(app);

// Initialize Analytics only in browser
let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    console.log('Analytics initialized successfully');
  } catch (error) {
    console.error('Error initializing Analytics:', error);
  }
}

// Initialize Storage
const storage = getStorage(app);

// Remove emulator connections for now
// if (process.env.NODE_ENV === 'development') {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectAuthEmulator(auth, 'http://localhost:9099');
//     console.log('Connected to Firebase emulators');
//   } catch (error) {
//     console.error('Error connecting to emulators:', error);
//   }
// }

// Credit management functions
export const DEFAULT_CREDITS = 10;

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
    
    return userDoc.data().credits || 0;
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

// Remove the duplicate auth.onAuthStateChanged listener and keep only one
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log('User logged in:', user.uid);
    await initializeUserCredits(user);
  } else {
    console.log('User logged out');
  }
});

export { app, auth, db, analytics, storage }; 
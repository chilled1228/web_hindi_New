import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { Analytics, getAnalytics } from 'firebase/analytics';

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

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.error('Error connecting to emulators:', error);
  }
}

export { app, auth, db, analytics }; 
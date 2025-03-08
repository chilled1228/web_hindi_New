import * as admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Check all required environment variables
const requiredEnvVars = {
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
} as const;

// Validate environment variables and assign types
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyBase = process.env.FIREBASE_PRIVATE_KEY;

// Log environment variable status (not the actual values)
console.log('Firebase Admin Environment Variables Status:', {
  FIREBASE_PROJECT_ID: !!projectId,
  FIREBASE_CLIENT_EMAIL: !!clientEmail,
  FIREBASE_PRIVATE_KEY: !!privateKeyBase,
  FIREBASE_PRIVATE_KEY_LENGTH: privateKeyBase?.length || 0,
  NODE_ENV: process.env.NODE_ENV,
});

if (!projectId || !clientEmail || !privateKeyBase) {
  console.error('Missing required Firebase Admin environment variables');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required Firebase Admin environment variables');
  }
}

// Format private key - handle different formats that might come from environment variables
const formatPrivateKey = (key: string | undefined): string => {
  if (!key) return '';
  
  // If the key already contains newlines, it's properly formatted
  if (key.includes('-----BEGIN PRIVATE KEY-----') && key.includes('\n')) {
    return key;
  }
  
  // If the key has escaped newlines (\n), replace them with actual newlines
  if (key.includes('\\n')) {
    return key.replace(/\\n/g, '\n');
  }
  
  // If the key is a single line without newlines, add them
  if (key.includes('-----BEGIN PRIVATE KEY-----') && !key.includes('\n')) {
    return key
      .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
      .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----\n');
  }
  
  return key;
};

const privateKey = formatPrivateKey(privateKeyBase);

// Initialize Firebase Admin
const getFirebaseApp = () => {
  if (getApps().length > 0) {
    return getApp();
  }

  try {
    const config = {
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      } as admin.ServiceAccount),
      databaseURL: `https://${projectId}.firebaseio.com`
    };
      
    console.log('Initializing Firebase Admin with config:', {
      projectId,
      clientEmail: clientEmail ? 'Set' : 'Not Set',
      privateKey: privateKey ? 'Set' : 'Not Set',
      privateKeyLength: privateKey?.length || 0,
      databaseURL: config.databaseURL,
    });
      
    return initializeApp(config);
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    
    // In development, provide a mock app for easier local development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using mock Firebase Admin in development');
      return {} as admin.app.App;
    }
    
    throw error;
  }
};

// Initialize app and Firestore with error handling
let db: Firestore;
try {
  const app = getFirebaseApp();
  db = getFirestore(app);
  console.log('Firestore initialized successfully');
} catch (error) {
  console.error('Error initializing Firestore:', error);
  
  // In development, provide a mock Firestore for easier local development
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Using mock Firestore in development');
    db = {} as Firestore;
  } else {
    throw error;
  }
}

export { db }; 
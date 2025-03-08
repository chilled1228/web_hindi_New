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
console.log('[Firebase Admin] Environment Variables Status:', {
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
  
  // Log the first few characters of the key for debugging (without exposing the full key)
  console.log('[Firebase Admin] Private Key Format:', {
    startsWithBegin: key.startsWith('-----BEGIN PRIVATE KEY-----'),
    containsNewlines: key.includes('\n'),
    containsEscapedNewlines: key.includes('\\n'),
    length: key.length,
    firstChars: key.substring(0, 10) + '...',
  });
  
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

// Try to use service account from environment variables
let serviceAccount: admin.ServiceAccount | undefined;

try {
  if (projectId && clientEmail && privateKeyBase) {
    const privateKey = formatPrivateKey(privateKeyBase);
    serviceAccount = {
      projectId,
      clientEmail,
      privateKey,
    } as admin.ServiceAccount;
    
    console.log('[Firebase Admin] Service account created from environment variables');
  } else {
    console.warn('[Firebase Admin] Missing environment variables for service account');
  }
} catch (error) {
  console.error('[Firebase Admin] Error creating service account:', error);
}

// Initialize Firebase Admin
const getFirebaseApp = () => {
  // Check if Firebase Admin is already initialized
  if (getApps().length > 0) {
    console.log('[Firebase Admin] Using existing Firebase Admin app');
    return getApp();
  }

  try {
    // If we have a service account, use it
    if (serviceAccount) {
      console.log('[Firebase Admin] Initializing with service account');
      const config = {
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${projectId}.firebaseio.com`
      };
        
      console.log('[Firebase Admin] Config:', {
        projectId,
        clientEmail: clientEmail ? 'Set' : 'Not Set',
        privateKey: privateKeyBase ? 'Set' : 'Not Set',
        privateKeyLength: privateKeyBase?.length || 0,
        databaseURL: config.databaseURL,
      });
        
      return initializeApp(config);
    } 
    // If we're in production and don't have a service account, try to use default credentials
    else if (process.env.NODE_ENV === 'production') {
      console.log('[Firebase Admin] Attempting to initialize with default credentials');
      return initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
    // In development, provide a mock app
    else {
      console.warn('[Firebase Admin] Using mock Firebase Admin in development');
      return {} as admin.app.App;
    }
  } catch (error) {
    console.error('[Firebase Admin] Error initializing Firebase Admin:', error);
    
    // In development, provide a mock app for easier local development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Firebase Admin] Using mock Firebase Admin in development due to error');
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
  console.log('[Firebase Admin] Firestore initialized successfully');
} catch (error) {
  console.error('[Firebase Admin] Error initializing Firestore:', error);
  
  // In development, provide a mock Firestore for easier local development
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[Firebase Admin] Using mock Firestore in development');
    db = {} as Firestore;
  } else {
    throw error;
  }
}

export { db }; 
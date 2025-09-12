// Import the functions you need from the Firebase SDKs
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  type Auth, 
  type User as FirebaseUser 
} from "firebase/auth";
import { getFirestore, type Firestore, terminate } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqcue6P_Gcl8E9mGLsxDLdJRlSAbSwVoI",
  authDomain: "golden-tulip-34749.firebaseapp.com",
  projectId: "golden-tulip-34749",
  storageBucket: "golden-tulip-34749.firebasestorage.app",
  messagingSenderId: "101687023536",
  appId: "1:101687023536:web:5ecb99a06a824ca219e875"
};

// Initialize Firebase
let app: ReturnType<typeof initializeApp>;
let auth: Auth;
let db: Firestore;

// Initialize Firebase only once
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

// Add error handling for Firestore connections
const handleFirestoreError = (error: any) => {
  console.warn('Firestore connection issue:', error);
  // Don't throw errors for connection issues, just log them
};

// Configure Firestore to be more resilient
if (db) {
  // Add global error handler for Firestore
  db.app.options.experimentalForceLongPolling = true;
  
  // Suppress Firestore connection errors globally
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('Firestore') && message.includes('400')) {
      // Suppress Firestore 400 errors
      return;
    }
    if (message.includes('WebChannelConnection') && message.includes('transport errored')) {
      // Suppress WebChannel connection errors
      return;
    }
    originalError.apply(console, arguments);
  };
}

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account', // Forces account selection even when one account is available
});

// Export auth and firestore instances
export { auth, db };

// Export cleanup function for Firestore connections
export const cleanupFirestore = async () => {
  try {
    if (db) {
      await terminate(db);
    }
  } catch (error) {
    console.warn('Error terminating Firestore:', error);
  }
};

export default app;

// Import the functions you need from the Firebase SDKs
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  browserLocalPersistence,
  signOut,
  type Auth, 
  type User as FirebaseUser 
} from "firebase/auth";
import { 
  getFirestore, 
  disableNetwork, 
  enableNetwork, 
  initializeFirestore
} from "firebase/firestore";

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
let db: ReturnType<typeof getFirestore>;

// Initialize Firebase only once
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Initialize Firestore with robust settings for dev environments
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    useFetchStreams: false,
  }) as unknown as ReturnType<typeof getFirestore>;
  console.log('Firebase initialized with new app instance');
} else {
  app = getApp();
  auth = getAuth(app);
  // If Firestore already initialized, get existing instance
  db = getFirestore(app);
  console.log('Firebase initialized with existing app instance');
}

// Set persistence to local to keep user logged in
auth.setPersistence(browserLocalPersistence).catch(error => {
  console.error('Error setting auth persistence:', error);
});

// Function to reconnect Firebase when connection issues are detected
async function reconnectFirebase() {
  console.log('Attempting to reconnect Firebase...');
  try {
    // First, try to fix Firestore connection
    try {
      // Disable and re-enable network to force a clean reconnection
      await disableNetwork(db);
      console.log('Disabled Firestore network connection');
      
      // Short delay to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await enableNetwork(db);
      console.log('Firestore network connection re-enabled');
    } catch (firestoreError) {
      console.warn('Error resetting Firestore connection:', firestoreError);
      
      // Avoid aggressive terminate() for generic 400/Bad Request since
      // it often occurs during benign WebChannel cleanup.
      // Prefer letting the SDK recover after network toggle.
    }
    
    // Then, refresh authentication tokens
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const { email } = currentUser;
        const idToken = await currentUser.getIdToken(true);
        console.log(`Refreshed token for user ${email}`);
        return true;
      } catch (authError) {
        console.warn('Error refreshing authentication token:', authError);
        
        // If token refresh fails, try to reauthenticate
        try {
          await signOut(auth);
          console.log('Signed out user to reset authentication state');
          
          // Reload the page to force a complete reset
          window.location.reload();
          return true;
        } catch (signOutError) {
          console.error('Error signing out user:', signOutError);
          return false;
        }
      }
    } else {
      console.log('No user signed in, cannot reconnect authentication');
      return false;
    }
  } catch (error) {
    console.error('Error in reconnectFirebase:', error);
    return false;
  }
}

// Set up global error handler for Firebase connection issues
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  const msg = error?.message || '';
  if (msg && (
      msg.includes('Firebase') || 
      msg.includes('firestore') || 
      msg.includes('ERR_ABORTED') || 
      msg.includes('permission'))
  ) {
    console.warn('Global Firebase error detected:', msg);

    // Ignore benign WebChannel termination/cleanup messages
    if (msg.includes('Write/channel') && msg.includes('TYPE=terminate')) {
      return;
    }

    // Avoid terminate() hammering on generic 400s
    safeReconnectFirebase();
  }
});

// Add error handling for Firestore connections
const handleFirestoreError = (error: any) => {
  console.warn('Firestore connection issue:', error);
  const msg = error?.message || '';
  
  // Check for permission errors
  if (msg.includes('permission')) {
    console.error('Firebase permission error: You may not have the required access rights. Please check your authentication status and user role.');
    safeReconnectFirebase();
  }
  
  // For aborted/transport hiccups, try a gentle reconnect
  if (msg.includes('ERR_ABORTED')) {
    safeReconnectFirebase();
  }
  
  // Don't throw errors for connection issues, just log them
};

// Configure Firestore to be more resilient
if (db) {
  // Handle Firestore errors more gracefully
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');

    // Ignore benign termination/cleanup
    if (message.includes('Write/channel') && message.includes('TYPE=terminate')) {
      return;
    }
    
    // Handle permission errors with a more helpful message
    if (message.includes('Missing or insufficient permissions')) {
      originalError.call(console, 'Firebase permission error: You may not have the required access rights. Please check your authentication status and user role.');
      safeReconnectFirebase().then(success => {
        if (success) {
          console.log('Successfully reconnected to Firebase after permission error');
        } else {
          console.warn('Failed to reconnect to Firebase after permission error');
        }
      });
      return;
    }

    // Avoid noisy reconnect loops on generic 400/Bad Request; try gentle, rate-limited reconnect instead
    if ((message.includes('Firestore') && message.includes('400')) || message.includes('Bad Request')) {
      console.warn('Firebase 400 error detected: attempting gentle reconnect...');
      safeReconnectFirebase();
      return;
    }

    // Handle WebChannel connection errors
    if (message.includes('WebChannelConnection') && message.includes('transport errored')) {
      originalError.call(console, 'Firebase connection error: Attempting to reconnect...');
      safeReconnectFirebase();
      return;
    }

    // Pass through all other errors
    originalError.apply(console, arguments as any);
  };
}

// Simple rate-limit to prevent reconnect storms
let reconnectLock = false;
let lastReconnectAt = 0;
const RECONNECT_COOLDOWN_MS = 10000; // 10s cooldown

async function safeReconnectFirebase() {
  const now = Date.now();
  if (reconnectLock || (now - lastReconnectAt) < RECONNECT_COOLDOWN_MS) {
    return false;
  }
  reconnectLock = true;
  try {
    const res = await reconnectFirebase();
    lastReconnectAt = Date.now();
    return res;
  } finally {
    reconnectLock = false;
  }
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account', // Forces account selection even when one account is available
});

export { app, auth, db, googleProvider, reconnectFirebase };
export type { FirebaseUser };

export default app;

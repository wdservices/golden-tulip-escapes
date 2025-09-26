import { auth, db } from '@/lib/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, connectFirestoreEmulator } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase connection...');
  
  try {
    // Test 1: Check if Firebase is initialized
    console.log('✅ Firebase app initialized');
    console.log('Auth instance:', auth);
    console.log('Firestore instance:', db);
    
    // Test 2: Check network connectivity to Firebase
    console.log('🌐 Testing network connectivity...');
    
    // Test 3: Try to connect to Firestore
    console.log('📊 Testing Firestore connection...');
    try {
      const testCollection = collection(db, 'test');
      await getDocs(testCollection);
      console.log('✅ Firestore connection successful');
    } catch (firestoreError: any) {
      console.error('❌ Firestore connection failed:', firestoreError);
      console.error('Error code:', firestoreError.code);
      console.error('Error message:', firestoreError.message);
      
      // Check if it's a network error
      if (firestoreError.code === 'unavailable' || 
          firestoreError.message.includes('network-request-failed') ||
          firestoreError.message.includes('ERR_NETWORK')) {
        console.error('🚨 Network connectivity issue detected');
        return { success: false, error: 'network', details: firestoreError };
      }
      
      return { success: false, error: 'firestore', details: firestoreError };
    }
    
    // Test 4: Try authentication
    console.log('🔐 Testing authentication...');
    try {
      // Check current auth state
      const currentUser = auth.currentUser;
      console.log('Current user:', currentUser);
      
      if (!currentUser) {
        console.log('No user signed in, testing anonymous auth...');
        const userCredential = await signInAnonymously(auth);
        console.log('✅ Anonymous authentication successful:', userCredential.user.uid);
      } else {
        console.log('✅ User already authenticated:', currentUser.uid);
      }
    } catch (authError: any) {
      console.error('❌ Authentication failed:', authError);
      console.error('Auth error code:', authError.code);
      console.error('Auth error message:', authError.message);
      
      // Check if it's a network error
      if (authError.code === 'auth/network-request-failed' ||
          authError.message.includes('network-request-failed') ||
          authError.message.includes('ERR_NETWORK')) {
        console.error('🚨 Authentication network error detected');
        return { success: false, error: 'auth-network', details: authError };
      }
      
      return { success: false, error: 'auth', details: authError };
    }
    
    console.log('✅ All Firebase tests passed');
    return { success: true };
    
  } catch (error: any) {
    console.error('❌ Firebase test failed:', error);
    return { success: false, error: 'general', details: error };
  }
};

// Function to check network connectivity
export const checkNetworkConnectivity = async () => {
  console.log('🌐 Checking network connectivity...');
  
  try {
    // Test basic internet connectivity
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('✅ Basic internet connectivity: OK');
    
    // Test Firebase endpoints
    try {
      const firebaseResponse = await fetch('https://firebase.googleapis.com/', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      console.log('✅ Firebase endpoints reachable');
    } catch (firebaseError) {
      console.error('❌ Firebase endpoints not reachable:', firebaseError);
      return { success: false, error: 'firebase-endpoints', details: firebaseError };
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Network connectivity test failed:', error);
    return { success: false, error: 'network', details: error };
  }
};
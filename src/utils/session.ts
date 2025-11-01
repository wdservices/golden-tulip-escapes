import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { getDeviceInfo } from '@/utils/device';

interface SessionData {
  userId: string;
  status: 'active' | 'inactive';
  loginTime: Date;
  logoutTime?: Date;
  deviceInfo?: string;
}

/**
 * Create a new session for a user
 */
export const createSession = async (userId: string): Promise<string> => {
  try {
    // End any existing active sessions
    await endUserSessions(userId);
    
    // Create new session
    const deviceInfo = getDeviceInfo();
    const sessionData = {
      userId,
      status: 'active',
      loginTime: serverTimestamp(),
      deviceInfo: `${deviceInfo.browser} on ${deviceInfo.os}`
    };

    const docRef = await addDoc(collection(db, 'sessions'), sessionData);
    return docRef.id;
  } catch (error) {
    // Silently handle permissions errors to prevent console spam
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      // Session management is not critical, silently fail
      return '';
    }
    console.warn('Session creation failed (non-critical):', error);
    // Don't block login if session creation fails
    return '';
  }
};

/**
 * End all active sessions for a user
 */
export const endUserSessions = async (userId: string): Promise<void> => {
  try {
    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    const batch = [];
    
    querySnapshot.forEach((doc) => {
      batch.push(
        updateDoc(doc.ref, {
          status: 'inactive',
          logoutTime: serverTimestamp()
        })
      );
    });

    await Promise.all(batch);
  } catch (error) {
    // Silently handle permissions errors to prevent console spam
    if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
      // Session management is not critical, silently fail
      return;
    }
    console.warn('Error ending sessions (non-critical):', error);
    // Don't throw error as session management is not critical
  }
};

/**
 * Get the current active session for a user
 */
export const getActiveSession = async (userId: string) => {
  try {
    const sessionsRef = collection(db, 'sessions');
    const q = query(
      sessionsRef,
      where('userId', '==', userId),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting active session:', error);
    return null;
  }
};

// Removed IP detection to avoid CSP issues
// IP detection should be handled server-side if needed;

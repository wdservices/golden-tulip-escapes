import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile } from '@/types/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { createSession, endUserSessions } from '@/utils/session';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseAuthUser,
  UserInfo
} from 'firebase/auth';
import { isAdmin } from '@/utils/auth';
import { toast } from 'sonner';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseAuthUser | null;
  login: (email: string, password: string) => Promise<string>; // Returns the redirect path
  register: (name: string, email: string, phone: string, password: string, isAdmin?: boolean) => Promise<UserProfile>;
  logout: () => Promise<boolean>; // Returns success status
  signInWithGoogle: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateUserRole: (userId: string, role: 'admin' | 'user') => Promise<void>;
  setupNavigation: (navigate: (to: string) => void) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigateFn, setNavigateFn] = useState<((to: string) => void) | null>(null);

  // Map Firebase user to our UserProfile type
  const mapFirebaseUser = (user: FirebaseAuthUser | null): UserProfile | null => {
    if (!user) return null;
    
    // In development, check for mock user first
    if (process.env.NODE_ENV === 'development' && window.mockUser) {
      return window.mockUser as UserProfile;
    }
    
    // Check if user is admin based on email (only allow specific admin emails)
    const adminEmails = ['admin@example.com', 'hello.goldentulip@gmail.com'];
    const isAdminUser = adminEmails.includes(user.email?.toLowerCase() || '');
    
    // Get creation and last sign-in times
    const creationTime = (user.metadata as any)?.creationTime;
    const lastSignInTime = (user.metadata as any)?.lastSignInTime || new Date().toISOString();
    
    return {
      id: user.uid,
      name: user.displayName || 'Guest',
      email: user.email || '',
      phone: user.phoneNumber || '',
      photoURL: user.photoURL || undefined,
      joinDate: creationTime || new Date().toISOString(),
      lastLogin: lastSignInTime,
      role: isAdminUser ? 'admin' : 'user',
      preferences: {}
    };
  };

  // Handle auth state changes
  useEffect(() => {
    let unsubscribe: () => void;
    let firestoreCleanup: (() => void) | null = null;

    // Check for mock user in window object for development
    const checkForMockUser = () => {
      if (process.env.NODE_ENV === 'development' && window.mockUser) {
        console.log('Using mock user:', window.mockUser);
        const mockProfile = window.mockUser as UserProfile;
        setCurrentUser(mockProfile);
        setFirebaseUser({
          uid: mockProfile.id,
          email: mockProfile.email,
          displayName: mockProfile.name,
          // Add other required Firebase User properties
        } as FirebaseAuthUser);
        setIsLoading(false);
        return true;
      }
      return false;
    };

    // Function to handle Firestore operations with retry logic
    const handleFirestoreOperations = async (user: FirebaseAuthUser | null) => {
      if (!user) return;
      
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (!docSnap.exists()) {
          await setDoc(userDocRef, {
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            phone: user.phoneNumber || '',
            photoURL: user.photoURL || '',
            role: 'user',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error('Error in Firestore operations:', error);
        // Don't block the auth flow if Firestore is down
        toast.warning('Connected to auth service, but having trouble with database. Some features may be limited.');
      }
    };

    // Only check Firebase auth if we're not in a mock user session
    if (!checkForMockUser()) {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          const userProfile = mapFirebaseUser(user);
          setFirebaseUser(user);
          setCurrentUser(userProfile);
          
          // Handle Firestore operations in the background
          if (user) {
            handleFirestoreOperations(user).catch(console.error);
          }
          
          // Only redirect if not already on the dashboard or admin page
          if (user && navigateFn) {
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/dashboard') && !currentPath.startsWith('/admin')) {
              navigateFn('/dashboard');
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          setIsLoading(false);
        }
      }, (error) => {
        console.error('Auth state change error:', error);
        setError(error.message);
        setIsLoading(false);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (firestoreCleanup) firestoreCleanup();
    };
  }, [navigateFn]);

  // Set up navigation function
  const setupNavigation = useCallback((navigate: (to: string) => void) => {
    setNavigateFn(() => navigate);
  }, []);

  const login = async (email: string, password: string): Promise<string> => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Create timeout promises for authentication and Firestore operations
      const authTimeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout')), 10000)
      );

      const firestoreTimeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Firestore timeout')), 3000) // Reduced timeout for faster login
      );

      // Authenticate user with timeout
      const userCredential = await Promise.race([
        signInWithEmailAndPassword(auth, email, password),
        authTimeoutPromise
      ]);
      
      const user = userCredential.user;
      
      // Check if user exists in Firestore with timeout, but don't wait for it
      // This allows immediate navigation while data loads in background
      const userDocRef = doc(db, 'users', user.uid);
      
      // Check if user document exists in Firestore
      getDoc(userDocRef).then((docSnap) => {
        if (!docSnap.exists()) {
          // Create user profile if it doesn't exist
          const userData = {
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            phone: user.phoneNumber || '',
            photoURL: user.photoURL || '',
            role: 'user',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          
          setDoc(userDocRef, userData).catch(err => {
            console.warn('Error creating user profile:', err);
          });
        }
      }).catch(err => {
        console.warn('Error checking user profile:', err);
      });

      // Don't wait for Firestore check, return immediately
      const isAdminUser = ['admin@example.com', 'hello.goldentulip@gmail.com']
        .includes(user.email?.toLowerCase() || '');

      // Update local user state immediately
      const userProfile: UserProfile = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: isAdminUser ? 'admin' : 'user',
        lastLogin: new Date().toISOString()
      };
      
      setCurrentUser(userProfile);
      
      return isAdminUser ? '/admin' : '/dashboard';
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string, isAdmin: boolean = false) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await firebaseUpdateProfile(userCredential.user, { displayName: name });
      
      // Check if this is the test admin user
      const isTestAdmin = email === 'admin@example.com' && process.env.NODE_ENV === 'development';
      
      // Create user object
      const user: UserProfile = {
        id: userCredential.user.uid,
        name,
        email,
        phone,
        photoURL: userCredential.user.photoURL || undefined,
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        role: isAdmin || isTestAdmin ? 'admin' : 'user',
        preferences: {}
      };
      
      // For test admin in development, set the mock user
      if (isTestAdmin) {
        // @ts-ignore - Setting mock user for development
        window.mockUser = user;
      }
      
      setCurrentUser(user);
      
      if (navigateFn) {
        navigateFn('/dashboard');
      }
      
      return user;
    } catch (err: any) {
      let errorMessage = 'Failed to register. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or login.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setError(errorMessage);
      console.error('Registration error:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear the current user first to prevent ProtectedRoute from redirecting to auth
      setCurrentUser(null);
      setFirebaseUser(null);
      
      // End all active sessions
      if (firebaseUser) {
        await endUserSessions(firebaseUser.uid);
      }
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Navigate to landing page
      window.location.href = '/';
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to log out');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
      // Navigation is handled by the auth state change listener
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      console.error('Google sign in error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!firebaseUser) return;
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Update Firebase profile if display name or photo URL changed
      const firebaseUpdates: { displayName?: string; photoURL?: string } = {};
      
      if (updates.name !== undefined) {
        firebaseUpdates.displayName = updates.name;
      }
      
      if (updates.photoURL !== undefined) {
        firebaseUpdates.photoURL = updates.photoURL;
      }
      
      if (Object.keys(firebaseUpdates).length > 0) {
        await firebaseUpdateProfile(firebaseUser, firebaseUpdates);
      }
      
      // Update local user state
      setCurrentUser(prev => ({
        ...prev!,
        ...updates
      } as UserProfile));
      
      // Here you might want to update additional user data in Firestore
      // Example: await updateUserInFirestore(auth.currentUser.uid, updates);
      
    } catch (err: any) {
      setError('Failed to update profile. Please try again.');
      console.error('Update profile error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can update user roles');
    }
    
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { role }, { merge: true });
    
    // If updating the current user, update local state
    if (currentUser.id === userId) {
      setCurrentUser({ ...currentUser, role });
    }
    
    toast.success(`User role updated to ${role}`);
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    login,
    register,
    logout,
    signInWithGoogle,
    updateProfile,
    updateUserRole,
    setupNavigation,
    isAuthenticated: !!currentUser,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

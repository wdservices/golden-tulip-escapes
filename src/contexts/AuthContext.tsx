import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile } from '@/types/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { createSession, endUserSessions } from '@/utils/session';
import { setDoc, doc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  User as FirebaseAuthUser,
  getIdTokenResult,
  UserInfo
} from 'firebase/auth';
import { isAdmin } from '@/utils/auth';
import { toast } from '@/hooks/use-toast';

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
  console.log('AuthProvider initialized');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigateFn, setNavigateFn] = useState<((to: string) => void) | null>(null);

  // Map Firebase user to our UserProfile type
  const mapFirebaseUser = async (user: FirebaseAuthUser | null): Promise<UserProfile | null> => {
    if (!user) {
      console.log('No Firebase user found');
      return null;
    }
    
    console.log('Firebase user found:', user.uid, user.email);
    
    // In development, check for mock user first
    if (process.env.NODE_ENV === 'development' && window.mockUser) {
      console.log('Using mock user in development');
      return window.mockUser as UserProfile;
    }
    
    // Get user claims to check role
    const idTokenResult = await user.getIdTokenResult();
    const hasAdminClaim = idTokenResult.claims.role === 'admin';
    
    // Check if user is admin by email (fallback if claims not set)
    const ADMIN_EMAILS = ['hello.goldentulip@gmail.com'];
    const isAdminByEmail = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
    
    const isAdminUser = hasAdminClaim || isAdminByEmail;
    
    console.log('Role detection for', user.email, ':', {
      hasAdminClaim,
      isAdminByEmail,
      isAdminUser,
      claims: idTokenResult.claims
    });
    
    // Get creation and last sign-in times
    const creationTime = user.metadata.creationTime;
    const lastSignInTime = user.metadata.lastSignInTime || new Date().toISOString();
    
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

    // Function to handle user data operations using Firebase Auth
    const handleUserData = async (user: FirebaseAuthUser | null) => {
      if (!user) return;
      
      try {
        // Check if user needs profile update
        if (!user.displayName) {
          await firebaseUpdateProfile(user, {
            displayName: user.email?.split('@')[0] || 'User'
          });
          console.log('Updated user profile in Firebase Auth');
        }
        
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
      } catch (error: any) {
        console.error('Error in Firebase Auth operations:', error);
        toast({
          title: "Error",
          description: "Error updating user profile. Some features may be limited.",
          variant: "destructive"
        });
      }
    };

    // Only check Firebase auth if we're not in a mock user session
    if (!checkForMockUser()) {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          const userProfile = await mapFirebaseUser(user);
          setFirebaseUser(user);
          setCurrentUser(userProfile);
          
          // Handle user data operations in Firebase Auth
          if (user) {
            handleUserData(user).catch((error) => {
              console.error('Background Firebase Auth operation failed:', error);
            });
          }
          
          // Auto-redirect based on user role
          if (userProfile && navigateFn && window.location.pathname === '/auth') {
            const targetPath = userProfile.role === 'admin' ? '/admin' : '/dashboard';
            navigateFn(targetPath);
          }
        } catch (error: any) {
          console.error('Error in auth state change:', error);
          toast({
            title: "Authentication Error",
            description: `Authentication error: ${error.message || 'Unknown error occurred'}`,
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }, (error) => {
        console.error('Auth state change error:', error);
        setError(error.message);
        toast({
          title: "Authentication Error",
          description: `Authentication error: ${error.message}`,
          variant: "destructive"
        });
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
      
      // Authenticate user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Force token refresh to get latest claims
      await user.getIdToken(true);
      
      // Get fresh token result with updated claims
      const idTokenResult = await user.getIdTokenResult(true);
      const isAdminUser = idTokenResult.claims.role === 'admin';
      
      // Create session
      await createSession(user.uid);
      
      // Update local user state
      const userProfile: UserProfile = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: isAdminUser ? 'admin' : 'user',
        lastLogin: new Date().toISOString()
      };
      
      // Ensure user document exists in appropriate Firestore collection (required for security rules)
      try {
        if (isAdminUser) {
          // Ensure admin user document exists in adminUsers collection
          const adminUserDocRef = doc(db, 'adminUsers', user.uid);
          await setDoc(adminUserDocRef, {
            email: userProfile.email,
            name: userProfile.name,
            phone: user.phoneNumber || '',
            branchId: 'main', // Default branch
            isActive: true,
            createdAt: user.metadata.creationTime || new Date().toISOString(),
            lastLogin: new Date().toISOString()
          }, { merge: true }); // Use merge to avoid overwriting existing data
          console.log('Admin user document ensured in adminUsers collection for:', userProfile.email);
        } else {
          // Ensure regular user document exists in users collection
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            ...userProfile,
            joinDate: user.metadata.creationTime || new Date().toISOString(),
            preferences: {}
          }, { merge: true }); // Use merge to avoid overwriting existing data
          console.log('User document ensured in users collection for:', userProfile.email);
        }
      } catch (firestoreError) {
        console.error('Failed to ensure user document in Firestore:', firestoreError);
        // Continue with login even if Firestore save fails
      }
      
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
      await firebaseUpdateProfile(userCredential.user, { 
        displayName: name,
        phoneNumber: phone // Note: phoneNumber updates require additional verification
      });
      
      // Create user object using metadata from Firebase Auth
      const user: UserProfile = {
        id: userCredential.user.uid,
        name,
        email,
        phone,
        photoURL: userCredential.user.photoURL || undefined,
        joinDate: userCredential.user.metadata.creationTime || new Date().toISOString(),
        lastLogin: userCredential.user.metadata.lastSignInTime || new Date().toISOString(),
        role: isAdmin ? 'admin' : 'user',
        preferences: {}
      };
      
      // Save user document to appropriate Firestore collection
      try {
        if (isAdmin) {
          // Save admin users to adminUsers collection
          const adminUserDoc = {
            email: user.email,
            name: user.name,
            phone: user.phone,
            branchId: 'main', // Default branch for new admin users
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: user.lastLogin
          };
          await setDoc(doc(db, 'adminUsers', userCredential.user.uid), adminUserDoc);
          console.log('Admin user document saved to adminUsers collection:', adminUserDoc);
        } else {
          // Save regular users to users collection
          await setDoc(doc(db, 'users', userCredential.user.uid), user);
          console.log('User document saved to users collection:', user);
        }
      } catch (firestoreError) {
        console.error('Failed to save user document to Firestore:', firestoreError);
        // Continue with registration even if Firestore save fails
      }
      
      // Create session
      await createSession(userCredential.user.uid);
      
      setCurrentUser(user);
      
      if (navigateFn) {
        // Redirect based on user role
        const targetPath = isAdmin ? '/admin' : '/dashboard';
        navigateFn(targetPath);
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
      // Redirect immediately to avoid showing loading states
      window.location.href = '/';
      
      // Clear the current user state
      setCurrentUser(null);
      setFirebaseUser(null);
      
      // End all active sessions in background
      if (firebaseUser) {
        endUserSessions(firebaseUser.uid).catch(console.error);
      }
      
      // Sign out from Firebase in background
      firebaseSignOut(auth).catch(console.error);
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, redirect to landing page
      window.location.href = '/';
      return false;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Force token refresh to get latest claims
      await user.getIdToken(true);
      
      // Get fresh token result with updated claims
      const idTokenResult = await user.getIdTokenResult(true);
      
      // Create a session
      await createSession(user.uid);
      
      // Navigate based on role from claims
      if (navigateFn) {
        navigateFn(idTokenResult.claims.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(error.message);
      throw error;
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

    try {
      // Call your backend API endpoint that uses Firebase Admin SDK to set custom claims
      const response = await fetch('/api/auth/set-custom-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Force token refresh to get new claims
      if (firebaseUser && firebaseUser.uid === userId) {
        await firebaseUser.getIdToken(true);
      }

      // Update local state if it's the current user
      if (currentUser.id === userId) {
        setCurrentUser({ ...currentUser, role });
      }

      toast({
        title: "Success",
        description: `User role updated to ${role}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
      throw error;
    }
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

// Function to refresh the auth token
const refreshAuthToken = async () => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.getIdToken(true); // Force token refresh
      console.log('Auth token refreshed successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing auth token:', error);
    return false;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Add token refresh method to the context
  const enhancedContext = {
    ...context,
    refreshAuthToken
  };
  
  return enhancedContext;
};

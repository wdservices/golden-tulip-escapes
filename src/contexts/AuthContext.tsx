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
import { handleFirebaseError, retryWithBackoff, checkNetworkConnectivity } from '@/utils/firebaseErrorHandler';
import { getBranchFromEmail } from '@/services/adminEmailService';

interface UserMeta {
  role?: 'branch-admin' | 'hq-admin' | 'user';
  branchIds?: string[];
}

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseAuthUser | null;
  userMeta: UserMeta;
  activeBranchId: string | null;
  setActiveBranchId: (id: string | null) => void;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (name: string, email: string, phone: string, password: string, isAdmin?: boolean) => Promise<UserProfile>;
  logout: () => Promise<boolean>; // Returns success status
  signInWithGoogle: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
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
  const [userMeta, setUserMeta] = useState<UserMeta>({});
  const [activeBranchId, setActiveBranchId] = useState<string | null>(() => {
    // Try to load from localStorage on initialization
    const savedBranchId = localStorage.getItem('activeBranchId');
    return savedBranchId ? savedBranchId : null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigateFn, setNavigateFn] = useState<((to: string) => void) | null>(null);

  // Define branch assignment type that matches getBranchFromEmail return type
  type BranchAssignment = {
    branchId: string;
    role: 'branch-admin' | 'hq-admin' | 'user';
  };

  // Map Firebase user to our UserProfile type and extract branch-related claims
  const mapFirebaseUser = async (user: FirebaseAuthUser | null): Promise<[UserProfile | null, UserMeta, string | null]> => {
    if (!user) {
      console.log('No Firebase user found');
      return [null, {}, null];
    }
    
    console.log('Firebase user found:', user.uid, user.email);
    
    // In development, check for mock user first
    if (process.env.NODE_ENV === 'development' && window.mockUser) {
      console.log('Using mock user in development');
      return [window.mockUser as UserProfile, { role: 'hq-admin', branchIds: ['all'] }, 'all'];
    }
    
    // Initialize with default values
    let emailBranchInfo: BranchAssignment = { branchId: '', role: 'user' };
    
    // Get ID token result for claims
    const idTokenResult = await user.getIdTokenResult();
    const claims = idTokenResult.claims as any;
    
    // Only check admin status if the email matches the admin domain or is a known admin
    if (user.email) {
      try {
        const branchInfo = await getBranchFromEmail(user.email);
        emailBranchInfo = branchInfo;
        console.log('User email processed:', user.email, 'Role:', emailBranchInfo.role, 'Branch:', emailBranchInfo.branchId);
      } catch (error) {
        console.error('Error getting branch from email:', error);
      }
    }
    
    // Use email-based assignment as primary, claims as fallback
    const adminRole = emailBranchInfo.role;
    const assignedBranchId = emailBranchInfo.branchId;
        // Set custom claims if user is a branch admin but doesn't have claims yet
      if (adminRole === 'branch-admin' && (!claims?.role || claims?.role !== 'branch-admin')) {
        try {
          // Call API to set custom claims
          const isDevClaims = (import.meta as any).env?.DEV;
          const API_BASE_URL = isDevClaims ? '/api' : ((import.meta as any).env?.VITE_NEXT_PUBLIC_API_URL || (import.meta as any).env?.NEXT_PUBLIC_API_URL || '/api');
          await fetch(`${API_BASE_URL}/auth/set-branch-admin-claims`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await user.getIdToken()}`
            },
            body: JSON.stringify({
              userId: user.uid,
              role: 'branch-admin',
              branchId: assignedBranchId
            })
          });
          
          // Force token refresh to get new claims
          await user.getIdToken(true);
          console.log('Set branch admin claims for user:', user.email, 'branch:', assignedBranchId);
        } catch (error) {
          console.error('Error setting branch admin claims:', error);
        }
    }
    
    // Create branch IDs array based on role and assignment
    const branchIds = [];
    if (assignedBranchId) {
      branchIds.push(assignedBranchId);
    } else if (claims.branchIds?.length) {
      branchIds.push(...claims.branchIds);
    }
    
    // Create user meta with role and branch IDs
    const userMeta: UserMeta = {
      role: adminRole,
      branchIds: branchIds
    };
    
    // For admins, set the first branch as active if none is set
    let activeBranch = activeBranchId;
    if (adminRole !== 'user' && branchIds.length > 0) {
      // If no active branch is set, or if the current active branch is not in the user's allowed branches
      if (!activeBranch || !branchIds.includes(activeBranch as string)) {
        activeBranch = branchIds[0] as string;
        setActiveBranchId(activeBranch);
        console.log(`Automatically set active branch for ${adminRole} to: ${activeBranch}`);
        
        // Save to localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('activeBranchId', activeBranch);
        }
      }
    }
    
    console.log('Email-based role detection for', user.email, ':', {
      adminRole,
      assignedBranchId,
      branchIds,
      emailBranchInfo
    });
    
    // Get creation and last sign-in times
    const creationTime = user.metadata.creationTime;
    const lastSignInTime = user.metadata.lastSignInTime || new Date().toISOString();
    
    // Create user profile
    const userProfile: UserProfile = {
      id: user.uid,
      name: user.displayName || 'Guest',
      email: user.email || '',
      phone: user.phoneNumber || '',
      photoURL: user.photoURL || undefined,
      joinDate: creationTime || new Date().toISOString(),
      lastLogin: lastSignInTime,
      role: adminRole !== 'user' ? 'admin' : 'user', // Keep backward compatibility
      preferences: {}
    };
    
    return [userProfile, userMeta, assignedBranchId || null];
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
        setUserMeta({ role: 'hq-admin', branchIds: ['all'] });
        
        // Set active branch for mock user
        handleSetActiveBranchId('all');
        
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
        console.log('🔥 Auth state changed - user:', user?.email, 'uid:', user?.uid);
        try {
          const [userProfile, meta, assignedBranchId] = await mapFirebaseUser(user);
          console.log('🔥 Mapped user profile:', {
            email: userProfile?.email,
            role: userProfile?.role,
            meta,
            assignedBranchId
          });
          
          setFirebaseUser(user);
          setCurrentUser(userProfile);
          setUserMeta(meta);
          
          // Automatically set active branch based on email assignment
          // Always prioritize email-based assignment over localStorage
          if (assignedBranchId) {
            // Clear any incorrect localStorage value and set the correct branch
            const currentStoredBranch = localStorage.getItem('activeBranchId');
            if (currentStoredBranch !== assignedBranchId) {
              console.log('🔥 Correcting branch assignment from localStorage:', currentStoredBranch, 'to email-based:', assignedBranchId);
            }
            handleSetActiveBranchId(assignedBranchId);
            console.log('🔥 Auto-assigned branch:', assignedBranchId, 'for user:', user?.email);
          } else {
            // If no branch assignment, clear any stored branch
            console.log('🔥 No branch assignment, clearing stored branch');
            handleSetActiveBranchId(null);
          }
          
          // Handle user data operations in Firebase Auth
          if (user) {
            handleUserData(user).catch((error) => {
              console.error('Background Firebase Auth operation failed:', error);
            });
          }
          
          // Disable auto-redirect to prevent conflicts with login form navigation
          // The login form will handle navigation after successful authentication
          if (userProfile && navigateFn && window.location.pathname === '/auth') {
            console.log('AuthContext: User authenticated on auth page, letting login form handle navigation:', {
              userEmail: userProfile.email,
              userRole: userProfile.role,
              currentPath: window.location.pathname,
              isAuthenticated: !!userProfile
            });
          }
        } catch (error: any) {
          const errorInfo = handleFirebaseError(error, 'Authentication');
          setError(errorInfo.userFriendlyMessage);
        } finally {
          setIsLoading(false);
        }
      }, (error) => {
        const errorInfo = handleFirebaseError(error, 'Authentication');
        setError(errorInfo.userFriendlyMessage);
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

  const login = async (email: string, password: string): Promise<UserProfile> => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Authenticate user with retry logic for network errors
      const userCredential = await retryWithBackoff(
        () => signInWithEmailAndPassword(auth, email, password),
        2, // max retries
        1000 // base delay
      );
      const user = userCredential.user;
      
      // Get token result to check role (no force refresh needed on login)
      const idTokenResult = await user.getIdTokenResult();
      const isAdminUser = idTokenResult.claims.role === 'admin' || 
                         idTokenResult.claims.role === 'branch-admin' || 
                         idTokenResult.claims.role === 'hq-admin';
      
      // Create session asynchronously (don't wait for it)
      createSession(user.uid).catch(error => {
        console.warn('Session creation failed:', error);
      });
      
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
      
      // Update Firestore document asynchronously (don't block login)
      const updateFirestoreDoc = async () => {
        try {
          if (isAdminUser) {
            const adminUserDocRef = doc(db, 'adminUsers', user.uid);
            await setDoc(adminUserDocRef, {
              email: userProfile.email,
              name: userProfile.name,
              phone: user.phoneNumber || '',
              branchId: 'main',
              isActive: true,
              lastLogin: new Date().toISOString()
            }, { merge: true });
          } else {
            const userDocRef = doc(db, 'users', user.uid);
            const allowedFields = ['name', 'phone', 'preferences', 'lastLogin', 'email', 'displayName', 'photoURL'];
            const filteredProfile = Object.fromEntries(
              Object.entries(userProfile).filter(([key]) => allowedFields.includes(key))
            );
            await setDoc(userDocRef, {
              ...filteredProfile,
              joinDate: user.metadata.creationTime || new Date().toISOString(),
              preferences: {}
            }, { merge: true });
          }
        } catch (firestoreError) {
          console.warn('Background Firestore update failed:', firestoreError);
        }
      };
      
      // Run Firestore update in background
      updateFirestoreDoc();
      
      return userProfile;
    } catch (error: any) {
      const errorInfo = handleFirebaseError(error, 'Login');
      setError(errorInfo.userFriendlyMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, password: string, isAdmin: boolean = false) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Check if email is in the branch admin list
      let isDetectedAdmin = false;
      let branchAssignment: BranchAssignment = { branchId: '', role: 'user' };
      
      // Only check admin status if the email matches the admin domain or is a known admin
      if (email && (email.endsWith('@goldentulip.com') || email.endsWith('@rivotels.com'))) {
        branchAssignment = await getBranchFromEmail(email);
        isDetectedAdmin = branchAssignment.role === 'branch-admin' || branchAssignment.role === 'hq-admin';
      }
      
      const finalIsAdmin = isAdmin || isDetectedAdmin;
      
      console.log('Registration email check:', {
        email,
        branchAssignment,
        isDetectedAdmin,
        finalIsAdmin
      });
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await firebaseUpdateProfile(userCredential.user, { 
        displayName: name
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
        role: finalIsAdmin ? 'admin' : 'user',
        preferences: {}
      };
      
      // Save user document to appropriate Firestore collection
      try {
        if (finalIsAdmin) {
          // Save admin users to adminUsers collection with branch assignment
          const adminUserDoc = {
            email: user.email,
            name: user.name,
            phone: user.phone,
            branchId: branchAssignment.branchId || 'main', // Use detected branch or default
            branchIds: branchAssignment.branchId ? [branchAssignment.branchId] : ['main'],
            role: branchAssignment.role || 'branch-admin',
            isActive: true,
            createdAt: new Date().toISOString(),
            lastLogin: user.lastLogin
          };
          await setDoc(doc(db, 'adminUsers', user.uid), adminUserDoc);
          console.log('Admin user document saved to adminUsers collection:', adminUserDoc);
          
          // Also save to users collection for compatibility
          await setDoc(doc(db, 'users', user.uid), user);
          console.log('Admin user also saved to users collection for compatibility');
        } else {
          // Save regular users to users collection
          await setDoc(doc(db, 'users', user.uid), user);
          console.log('User document saved to users collection:', user);
        }
      } catch (firestoreError) {
        console.error('Failed to save user document to Firestore:', firestoreError);
        // Continue with registration even if Firestore save fails
      }
      
      // Create session
      await createSession(user.id);
      
      setCurrentUser(user);
      
      if (navigateFn) {
        // Redirect based on user role and branch assignment
        let targetPath = '/dashboard';
        if (finalIsAdmin) {
          targetPath = '/admin';
          // Set the active branch for the admin user
          if (branchAssignment.branchId) {
            handleSetActiveBranchId(branchAssignment.branchId);
          }
        }
        console.log('Redirecting new user to:', targetPath, 'with branch:', branchAssignment.branchId);
        navigateFn(targetPath);
      }
      
      return user;
      
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
      const API_BASE_URL = (import.meta as any).env?.VITE_NEXT_PUBLIC_API_URL || (import.meta as any).env?.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${API_BASE_URL}/auth/set-custom-claims`, {
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

  // Implement setActiveBranchId function
  const handleSetActiveBranchId = (id: string | null) => {
    if (id) {
      localStorage.setItem('activeBranchId', id);
    } else {
      localStorage.removeItem('activeBranchId');
    }
    setActiveBranchId(id);
  };

  // Sign in with Google function
  const signInWithGoogle = async (): Promise<void> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user is an admin
      const branchInfo = await getBranchFromEmail(user.email || '');
      const isAdminUser = branchInfo.role !== 'user';
      
      // Create or update user in Firestore
      const userDoc = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        photoURL: user.photoURL || '',
        role: isAdminUser ? 'admin' : 'user',
        branchId: branchInfo.branchId || '',
        lastLogin: new Date().toISOString(),
        joinDate: user.metadata.creationTime || new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', user.uid), userDoc, { merge: true });
      
      // Set user state
      setCurrentUser(userDoc as UserProfile);
      setFirebaseUser(user);
      
      // Set active branch for admin users
      if (isAdminUser && branchInfo.branchId) {
        setActiveBranchId(branchInfo.branchId);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      setUserMeta({});
      setActiveBranchId(null);
      localStorage.removeItem('activeBranchId');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!firebaseUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      // Update Firebase Auth profile
      const profileUpdates: { displayName?: string; photoURL?: string } = {};
      
      if (updates.name) profileUpdates.displayName = updates.name;
      if (updates.photoURL) profileUpdates.photoURL = updates.photoURL;

      if (Object.keys(profileUpdates).length > 0) {
        await firebaseUpdateProfile(firebaseUser, profileUpdates);
      }

      // Update Firestore user document if there are additional fields
      const userDoc = doc(db, 'users', firebaseUser.uid);
      const userUpdates: Partial<UserProfile> = { ...updates };
      
      // Remove fields that shouldn't be updated directly
      delete userUpdates.id;
      delete userUpdates.email; // Email updates should be handled separately with email verification
      
      if (Object.keys(userUpdates).length > 0) {
        userUpdates.updatedAt = new Date().toISOString();
        await setDoc(userDoc, userUpdates, { merge: true });
      }

      // Update local state
      setCurrentUser(prev => (prev ? { ...prev, ...updates } : null));
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    userMeta,
    activeBranchId,
    setActiveBranchId: handleSetActiveBranchId,
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

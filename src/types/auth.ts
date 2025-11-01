// Base user type for our application
export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  role?: 'admin' | 'user' | 'staff';
  branch?: string;
  joinDate?: string;
  lastLogin?: string;
  lastSignInAt?: string;
  isAdmin?: boolean;
  bookingIds?: string[];
  updatedAt?: string;
  preferences?: {
    roomType?: string;
    floorPreference?: string;
    specialNeeds?: string[];
    language?: string;
    notifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
    [key: string]: any; // Allow additional preferences
  };
}

export interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: any; // Using any to avoid direct Firebase type dependency
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  setupNavigation: (navigate: (to: string) => void) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type User = UserProfile; // For backward compatibility

// Type for Firebase user metadata
export interface FirebaseUserMetadata {
  creationTime?: string;
  lastSignInTime?: string;
}

// Type for Firebase user
export interface FirebaseUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  metadata: FirebaseUserMetadata;
}

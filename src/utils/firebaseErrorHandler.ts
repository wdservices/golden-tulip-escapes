import { toast } from '@/hooks/use-toast';

export interface FirebaseErrorInfo {
  code: string;
  message: string;
  userFriendlyMessage: string;
  isNetworkError: boolean;
  shouldRetry: boolean;
  retryDelay?: number;
}

export const parseFirebaseError = (error: any): FirebaseErrorInfo => {
  const code = error?.code || 'unknown';
  const message = error?.message || 'Unknown error occurred';
  
  // Check for network-related errors
  const isNetworkError = 
    code === 'auth/network-request-failed' ||
    code === 'unavailable' ||
    message.includes('network-request-failed') ||
    message.includes('ERR_NETWORK') ||
    message.includes('ERR_INTERNET_DISCONNECTED') ||
    message.includes('Failed to fetch') ||
    message.includes('NetworkError');

  let userFriendlyMessage = '';
  let shouldRetry = false;
  let retryDelay = 0;

  switch (code) {
    case 'auth/network-request-failed':
      userFriendlyMessage = 'Network connection failed. Please check your internet connection and try again.';
      shouldRetry = true;
      retryDelay = 3000;
      break;
    
    case 'auth/too-many-requests':
      userFriendlyMessage = 'Too many failed attempts. Please wait a moment before trying again.';
      shouldRetry = true;
      retryDelay = 10000;
      break;
    
    case 'auth/user-not-found':
      userFriendlyMessage = 'No account found with this email address.';
      break;
    
    case 'auth/wrong-password':
      userFriendlyMessage = 'Incorrect password. Please try again.';
      break;
    
    case 'auth/invalid-email':
      userFriendlyMessage = 'Please enter a valid email address.';
      break;
    
    case 'auth/user-disabled':
      userFriendlyMessage = 'This account has been disabled. Please contact support.';
      break;
    
    case 'auth/email-already-in-use':
      userFriendlyMessage = 'An account with this email already exists.';
      break;
    
    case 'auth/weak-password':
      userFriendlyMessage = 'Password is too weak. Please choose a stronger password.';
      break;
    
    case 'permission-denied':
      userFriendlyMessage = 'You don\'t have permission to access this resource.';
      break;
    
    case 'unavailable':
      userFriendlyMessage = 'Service is temporarily unavailable. Please try again in a moment.';
      shouldRetry = true;
      retryDelay = 5000;
      break;
    
    case 'failed-precondition':
      if (message.includes('index')) {
        userFriendlyMessage = 'Database is being set up. Please try again in a few minutes.';
      } else {
        userFriendlyMessage = 'Database configuration issue. Please contact support if this persists.';
      }
      shouldRetry = true;
      retryDelay = 10000;
      break;
    
    default:
      if (isNetworkError) {
        userFriendlyMessage = 'Network connection issue. Please check your internet connection and try again.';
        shouldRetry = true;
        retryDelay = 3000;
      } else {
        userFriendlyMessage = 'An unexpected error occurred. Please try again.';
        shouldRetry = true;
        retryDelay = 2000;
      }
  }

  return {
    code,
    message,
    userFriendlyMessage,
    isNetworkError,
    shouldRetry,
    retryDelay
  };
};

export const handleFirebaseError = (error: any, context: string = 'Firebase operation') => {
  const errorInfo = parseFirebaseError(error);
  
  console.error(`${context} failed:`, {
    code: errorInfo.code,
    message: errorInfo.message,
    isNetworkError: errorInfo.isNetworkError
  });

  // Show user-friendly toast
  toast({
    title: `${context} Failed`,
    description: errorInfo.userFriendlyMessage,
    variant: "destructive",
    duration: errorInfo.isNetworkError ? 6000 : 4000
  });

  return errorInfo;
};

export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorInfo = parseFirebaseError(error);
      
      // Don't retry if it's not a retryable error
      if (!errorInfo.shouldRetry || attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = errorInfo.retryDelay || (baseDelay * Math.pow(2, attempt));
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // Try to fetch a valid Firebase endpoint
    const response = await fetch('https://firebase.googleapis.com/v1beta1/projects', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    console.warn('Network connectivity check failed:', error);
    return false;
  }
};
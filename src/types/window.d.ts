// Extend the Window interface to include our mock user
declare global {
  interface Window {
    mockUser?: {
      id: string;
      name: string;
      email: string;
      role: string;
      preferences: Record<string, any>;
    };
  }
}

export {}; // This file needs to be a module

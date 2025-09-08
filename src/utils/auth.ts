import { User } from "@/types/auth";

// List of admin emails
const ADMIN_EMAILS = [
  'hello.goldentulip@gmail.com'  // Admin email for the application
];

/**
 * Check if the current user has admin privileges
 * @param user The current user object
 * @returns boolean indicating if the user is an admin
 */
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  
  // Check if user has admin role
  if (user.role === 'admin') return true;
  
  // Check if user's email is in the admin list (case insensitive)
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return true;
  }
  
  return false;
}

/**
 * Get the user's role, defaulting to 'user' if not specified
 * @param user The current user object
 * @returns The user's role
 */
export function getUserRole(user: User | null): string {
  return user?.role || 'user';
}

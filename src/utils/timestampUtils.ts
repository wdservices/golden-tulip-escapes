import { Timestamp } from 'firebase/firestore';

/**
 * Converts a Timestamp to a Date object
 */
export const timestampToDate = (timestamp: Timestamp | Date | string | undefined): Date | undefined => {
  if (!timestamp) return undefined;
  
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  return undefined;
};

/**
 * Converts a Timestamp to an ISO string
 */
export const timestampToString = (timestamp: Timestamp | Date | string | undefined): string | undefined => {
  const date = timestampToDate(timestamp);
  return date?.toISOString();
};

/**
 * Safely checks if a value is a Timestamp
 */
export const isTimestamp = (value: any): value is Timestamp => {
  return value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function';
};

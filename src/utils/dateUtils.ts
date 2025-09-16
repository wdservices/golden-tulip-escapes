/**
 * Utility functions for date and time operations
 */

/**
 * Format a date to a localized string
 * @param date - Date object or date string
 * @param locale - Locale string (e.g., 'en-US')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, options);
};

/**
 * Format a time to a localized string
 * @param date - Date object or date string
 * @param locale - Locale string (e.g., 'en-US')
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export const formatTime = (
  date: Date | string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString(locale, options);
};

/**
 * Calculate the number of nights between two dates
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @returns Number of nights
 */
export const calculateNights = (checkIn: Date | string, checkOut: Date | string): number => {
  const start = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  
  // Reset time components to avoid timezone issues
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Add days to a date
 * @param date - Start date
 * @param days - Number of days to add
 * @returns New date with days added
 */
export const addDays = (date: Date | string, days: number): Date => {
  const result = typeof date === 'string' ? new Date(date) : new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Check if a date is between two other dates (inclusive)
 * @param date - Date to check
 * @param start - Start date
 * @param end - End date
 * @returns True if date is between start and end (inclusive)
 */
export const isDateBetween = (
  date: Date | string,
  start: Date | string,
  end: Date | string
): boolean => {
  const checkDate = typeof date === 'string' ? new Date(date) : new Date(date);
  const startDate = typeof start === 'string' ? new Date(start) : new Date(start);
  const endDate = typeof end === 'string' ? new Date(end) : new Date(end);
  
  // Reset time components for date-only comparison
  const check = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
  const startD = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endD = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  return check >= startD && check <= endD;
};

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if both dates are the same day
 */
export const isSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Get an array of dates between two dates
 * @param start - Start date
 * @param end - End date
 * @returns Array of dates between start and end (inclusive)
 */
export const getDatesInRange = (start: Date | string, end: Date | string): Date[] => {
  const startDate = typeof start === 'string' ? new Date(start) : new Date(start);
  const endDate = typeof end === 'string' ? new Date(end) : new Date(end);
  
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

/**
 * Format a date to YYYY-MM-DD format (for date inputs)
 * @param date - Date to format
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const formatDateForInput = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns True if the date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = typeof date === 'string' ? new Date(date) : new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate < today;
};

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if the date is today
 */
export const isToday = (date: Date | string): boolean => {
  const today = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : new Date(date);
  
  return isSameDay(today, checkDate);
};

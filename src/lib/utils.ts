import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Exports data to a CSV file
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 */
export function exportToCsv<T extends Record<string, any>>(data: T[], filename: string): void {
  if (!data || !data.length) return;
  
  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  // Add rows
  data.forEach(row => {
    const values = headers.map(header => {
      let value = row[header];
      
      // Format dates
      if (value instanceof Date) {
        value = format(value, 'yyyy-MM-dd HH:mm:ss');
      }
      // Handle nested objects and arrays
      else if (typeof value === 'object' && value !== null) {
        value = JSON.stringify(value);
      }
      
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      const escaped = String(value || '').replace(/"/g, '""');
      return /[,\n"]/.test(escaped) ? `"${escaped}"` : escaped;
    });
    
    csvContent += values.join(',') + '\n';
  });
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats a date to a readable string
 * @param date Date object or timestamp
 * @returns Formatted date string
 */
export function formatDate(date: Date | number | string | undefined | null): string {
  if (!date) return 'N/A';
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, 'MMM d, yyyy');
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid Date';
  }
}

/**
 * Formats a date and time to a readable string
 * @param date Date object or timestamp
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | number | string | undefined | null): string {
  if (!date) return 'N/A';
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return format(dateObj, 'MMM d, yyyy h:mm a');
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid Date';
  }
}

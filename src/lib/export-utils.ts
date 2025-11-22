/**
 * Utility functions for exporting data
 */

import { Booking } from "@/types/booking";
import { formatCurrency } from "@/utils/currencyUtils";

/**
 * Convert bookings data to CSV format
 */
export function exportBookingsToCSV(bookings: Booking[]): string {
  // Define CSV headers
  const headers = [
    "Booking ID",
    "Guest Name",
    "Guest Email",
    "Guest Phone",
    "Branch",
    "Room Type",
    "Room Number",
    "Check-in Date",
    "Check-out Date",
    "Status",
    "Total Amount",
    "Payment Status",
    "Booking Date",
    "Guests",
    "Special Requests",
  ];

  // Convert bookings to CSV rows
  const rows = bookings.map((booking) => [
    booking.id,
    booking.guestName || "",
    booking.guestEmail || "",
    booking.guestPhone || "",
    booking.branchName,
    booking.roomType,
    booking.roomNumber || "",
    booking.checkInDate,
    booking.checkOutDate,
    booking.status,
    formatCurrency(booking.totalAmount, 'NGN', 'en-NG'),
    booking.paymentStatus,
    booking.bookingDate,
    booking.guests.toString(),
    booking.specialRequests || "",
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCSVValue).join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Escape CSV values to handle commas, quotes, and newlines
 */
function escapeCSVValue(value: any): string {
  // Convert value to string if it's not already
  const stringValue = String(value || '');
  
  // If the value contains commas, quotes, or newlines, wrap it in quotes
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    // Double up any quotes in the value
    const escapedValue = stringValue.replace(/"/g, '""');
    return `"${escapedValue}"`;
  }
  return stringValue;
}

/**
 * Download data as a file
 */
export function downloadFile(data: string, filename: string, mimeType: string): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
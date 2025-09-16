/**
 * Utility functions for currency formatting and calculations
 */

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @param locale - Locale string (e.g., 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate the total amount for a booking
 * @param basePrice - Base price per night
 * @param nights - Number of nights
 * @param taxRate - Tax rate as a decimal (e.g., 0.1 for 10%)
 * @param serviceCharge - Service charge as a decimal (e.g., 0.05 for 5%)
 * @param discount - Discount amount (e.g., 20 for $20 off)
 * @param discountType - 'percentage' or 'fixed'
 * @returns Object containing subtotal, tax, service, discount, and total amounts
 */
export const calculateBookingTotal = (
  basePrice: number,
  nights: number,
  taxRate: number = 0.1,
  serviceCharge: number = 0.05,
  discount: number = 0,
  discountType: 'percentage' | 'fixed' = 'fixed'
): {
  subtotal: number;
  tax: number;
  service: number;
  discount: number;
  total: number;
} => {
  const subtotal = basePrice * nights;
  
  // Calculate discount amount
  let discountAmount = 0;
  if (discount > 0) {
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discount / 100);
    } else {
      discountAmount = Math.min(discount, subtotal); // Ensure discount doesn't make total negative
    }
  }
  
  const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = amountAfterDiscount * taxRate;
  const serviceFee = amountAfterDiscount * serviceCharge;
  const total = amountAfterDiscount + tax + serviceFee;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)), 
    tax: parseFloat(tax.toFixed(2)),
    service: parseFloat(serviceFee.toFixed(2)),
    discount: parseFloat(discountAmount.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
};

/**
 * Parse a currency string to a number
 * @param currencyString - The currency string to parse (e.g., '$1,234.56')
 * @param locale - The locale used for the currency string
 * @returns The parsed number or NaN if parsing fails
 */
export const parseCurrency = (currencyString: string, locale: string = 'en-US'): number => {
  // Get the decimal and group separators for the locale
  const parts = new Intl.NumberFormat(locale).formatToParts(1111.1);
  const decimalSeparator = parts.find(part => part.type === 'decimal')?.value || '.';
  const groupSeparator = parts.find(part => part.type === 'group')?.value || ',';
  
  // Create a regex to remove all non-numeric characters except the decimal separator
  const regex = new RegExp(`[^0-9${decimalSeparator}]`, 'g');
  const numericString = currencyString
    .replace(regex, '')
    .replace(new RegExp(`\\${decimalSeparator}`, 'g'), '.');
  
  return parseFloat(numericString);
};

/**
 * Calculate the number of loyalty points earned for a booking
 * @param amount - The total amount spent
 * @param pointsPerDollar - Number of points earned per dollar spent
 * @param roundToNearest - Round points to the nearest multiple of this number
 * @returns Number of loyalty points earned
 */
export const calculateLoyaltyPoints = (
  amount: number,
  pointsPerDollar: number = 1,
  roundToNearest: number = 1
): number => {
  const points = amount * pointsPerDollar;
  return Math.round(points / roundToNearest) * roundToNearest;
};

/**
 * Format a number with a specific number of decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number as a string
 */
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

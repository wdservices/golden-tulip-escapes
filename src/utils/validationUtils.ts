/**
 * Utility functions for form and data validation
 */

/**
 * Validates an email address
 * @param email - The email to validate
 * @returns True if the email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validates a phone number (basic validation)
 * @param phone - The phone number to validate
 * @returns True if the phone number is valid, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  // Basic phone validation - allows numbers, spaces, +, -, (, )
  const re = /^[+\d\s\-()]{8,20}$/;
  return re.test(phone);
};

/**
 * Validates a password
 * @param password - The password to validate
 * @param options - Validation options
 * @returns Object with validation result and error message if invalid
 */
export const validatePassword = (
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecialChar?: boolean;
  } = {}
): { isValid: boolean; message?: string } => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = true,
  } = options;

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`,
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (requireNumber && !/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number',
    };
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character',
    };
  }

  return { isValid: true };
};

/**
 * Validates a credit card number using Luhn algorithm
 * @param cardNumber - The credit card number to validate
 * @returns True if the credit card number is valid, false otherwise
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  // Remove all non-digit characters
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  // Check if the number is empty or contains non-digits
  if (!/^\d+$/.test(cleanNumber)) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through values starting from the right
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + 1;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

/**
 * Validates a credit card expiration date
 * @param month - Expiration month (1-12)
 * @param year - Expiration year (2 or 4 digits)
 * @returns True if the expiration date is valid and not in the past
 */
export const isValidExpirationDate = (month: number, year: number): boolean => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-11
  
  // Convert 2-digit year to 4-digit
  const fullYear = year < 100 ? 2000 + year : year;
  
  // Check if the date is in the future
  if (fullYear > currentYear) {
    return true;
  }
  
  if (fullYear === currentYear && month >= currentMonth) {
    return true;
  }
  
  return false;
};

/**
 * Validates a CVV (Card Verification Value)
 * @param cvv - The CVV to validate
 * @param cardType - Optional card type ('amex' or others)
 * @returns True if the CVV is valid
 */
export const isValidCVV = (cvv: string, cardType: string = ''): boolean => {
  // American Express CVV is 4 digits, others are usually 3
  const requiredLength = cardType.toLowerCase() === 'amex' ? 4 : 3;
  const re = new RegExp(`^\d{${requiredLength}}$`);
  return re.test(cvv);
};

/**
 * Validates a date string in YYYY-MM-DD format
 * @param dateString - The date string to validate
 * @returns True if the date is valid and in the future
 */
export const isValidFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date >= today;
};

/**
 * Validates a booking date range
 * @param checkIn - Check-in date string (YYYY-MM-DD)
 * @param checkOut - Check-out date string (YYYY-MM-DD)
 * @param minNights - Minimum number of nights required
 * @param maxNights - Maximum number of nights allowed
 * @returns Object with validation result and error message if invalid
 */
export const validateBookingDates = (
  checkIn: string,
  checkOut: string,
  minNights: number = 1,
  maxNights: number = 30
): { isValid: boolean; message?: string } => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return { isValid: false, message: 'Invalid date format' };
  }
  
  if (checkInDate >= checkOutDate) {
    return { isValid: false, message: 'Check-out date must be after check-in date' };
  }
  
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (nights < minNights) {
    return { 
      isValid: false, 
      message: `Minimum stay is ${minNights} night${minNights !== 1 ? 's' : ''}` 
    };
  }
  
  if (nights > maxNights) {
    return { 
      isValid: false, 
      message: `Maximum stay is ${maxNights} nights` 
    };
  }
  
  return { isValid: true };
};

/**
 * Trims and validates a required text field
 * @param value - The field value
 * @param fieldName - The name of the field for error messages
 * @returns Object with validation result and sanitized value
 */
export const validateRequiredField = (
  value: string,
  fieldName: string
): { isValid: boolean; message?: string; value: string } => {
  const trimmed = value.trim();
  
  if (!trimmed) {
    return { 
      isValid: false, 
      message: `${fieldName} is required`,
      value: trimmed
    };
  }
  
  return { 
    isValid: true, 
    value: trimmed 
  };
};

/**
 * Utility functions for validation
 */

/**
 * Validate email address
 * @param email - Email address to validate
 * @returns True if valid email
 */
export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate if a number is positive
 * @param value - Value to validate
 * @returns True if positive number
 */
export const validatePositiveNumber = (value: string | number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
};

/**
 * Validate duration format (e.g., "1h", "30m", "3600s")
 * @param duration - Duration string to validate
 * @returns True if valid duration format
 */
export const validateDuration = (duration: string): boolean => {
  return /^\d+[smhd]$/.test(duration);
};

/**
 * Validate Ethereum address
 * @param address - Address to validate
 * @returns True if valid Ethereum address
 */
export const validateAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate URL
 * @param url - URL to validate
 * @returns True if valid URL
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate price per second (must be positive and reasonable)
 * @param price - Price to validate
 * @returns True if valid price
 */
export const validatePricePerSecond = (price: string | number): boolean => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(num) && num > 0 && num < 1000; // Reasonable upper limit
};

/**
 * Validate rental duration (must be positive and reasonable)
 * @param duration - Duration in seconds
 * @returns True if valid duration
 */
export const validateRentalDuration = (duration: number): boolean => {
  return duration > 0 && duration <= 31536000; // Max 1 year
};

/**
 * Validate NFT token ID
 * @param tokenId - Token ID to validate
 * @returns True if valid token ID
 */
export const validateTokenId = (tokenId: string | number): boolean => {
  const num = typeof tokenId === 'string' ? parseInt(tokenId) : tokenId;
  return !isNaN(num) && num >= 0 && Number.isInteger(num);
};

/**
 * Validate required field
 * @param value - Value to validate
 * @returns True if value is not empty
 */
export const validateRequired = (value: string | number | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

/**
 * Validate string length
 * @param value - String to validate
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @returns True if valid length
 */
export const validateLength = (value: string, minLength: number, maxLength: number): boolean => {
  return value.length >= minLength && value.length <= maxLength;
};

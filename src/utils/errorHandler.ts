/**
 * Utility functions for error handling
 */

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  return String(error);
}

export function logError(context: string, error: unknown): void {
  const message = getErrorMessage(error);
  console.error(`${context}:`, message);
}

export function createError(message: string, cause?: unknown): Error {
  const error = new Error(message);
  if (cause) {
    error.cause = cause;
  }
  return error;
}

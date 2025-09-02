/**
 * Error Handling Utilities
 * Provides consistent error handling across the application
 */

export interface AppError {
  message: string;
  cause?: unknown;
  code?: string | number;
  timestamp?: string;
}

/**
 * Converts unknown error types to standardized AppError format
 * Handles Error objects, strings, and objects with message properties
 */
export function toAppError(e: unknown, fallback = 'Unexpected error'): AppError {
  const timestamp = new Date().toISOString();
  
  if (e instanceof Error) {
    return { 
      message: e.message, 
      cause: e, 
      timestamp 
    };
  }
  
  if (typeof e === 'string') {
    return { 
      message: e, 
      timestamp 
    };
  }
  
  if (e && typeof e === 'object' && 'message' in e) {
    return { 
      message: String((e as any).message), 
      cause: e, 
      timestamp 
    };
  }
  
  return { 
    message: fallback, 
    cause: e, 
    timestamp 
  };
}

/**
 * Type guard to check if an error has a message property
 */
export function hasMessage(error: unknown): error is { message: string } {
  return error !== null && 
         typeof error === 'object' && 
         'message' in error && 
         typeof (error as any).message === 'string';
}

/**
 * Extracts error message from various error formats
 */
export function getErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (hasMessage(error)) return error.message;
  return fallback;
}

/**
 * Creates a user-friendly error message for display
 */
export function formatErrorForUser(error: unknown): string {
  const appError = toAppError(error);
  
  // Common error mappings for better UX
  const message = appError.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Connection error. Please check your internet connection and try again.';
  }
  
  if (message.includes('unauthorized') || message.includes('401')) {
    return 'Authentication required. Please log in and try again.';
  }
  
  if (message.includes('forbidden') || message.includes('403')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  if (message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  return appError.message;
}

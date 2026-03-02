/**
 * Momen Error System
 * Standardized error handling with error codes
 */

/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Error Code Enum
 */
export const ErrorCode = {
  // Authentication & Authorization
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  COMMON_PASSWORD: 'COMMON_PASSWORD',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Business Logic
  FEATURE_DISABLED: 'FEATURE_DISABLED',
  RATE_LIMITED: 'RATE_LIMITED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

  // Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

/**
 * Standard Error Response
 */
export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

/**
 * Predefined Error Classes
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: unknown) {
    super(ErrorCode.AUTH_REQUIRED, 401, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: unknown) {
    super(ErrorCode.FORBIDDEN, 403, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource not found') {
    super(ErrorCode.NOT_FOUND, 404, resource);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.VALIDATION_ERROR, 400, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.CONFLICT, 409, message, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', details?: unknown) {
    super(ErrorCode.RATE_LIMITED, 429, message, details);
  }
}

export class FeatureDisabledError extends AppError {
  constructor(feature: string, details?: unknown) {
    super(ErrorCode.FEATURE_DISABLED, 400, `${feature} is disabled`, details);
  }
}

/**
 * Format Zod errors for API responses
 */
export function formatZodError(error: {
  issues: Array<{
    path: (string | number)[];
    message: string;
  }>;
}): ErrorResponse {
  const details = error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  return {
    error: {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      details,
    },
  };
}

/**
 * Check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Get error response from unknown error
 */
export function toErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  // Zod error
  if (error && typeof error === 'object' && 'issues' in error) {
    return formatZodError(error as { issues: Array<{ path: (string | number)[]; message: string }> });
  }

  // Generic error
  return {
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    },
  };
}

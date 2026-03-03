/**
 * Momen API Error Handler Middleware
 * Wraps API route handlers with standardized error handling
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { toErrorResponse, isAppError } from '@/lib/errors';

// ============================================
// REQUEST ID GENERATION
// ============================================
function generateRequestId(): string {
  return `req_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================
export type ApiHandler = (request: NextRequest) => Promise<NextResponse>;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest) => {
    const requestId = generateRequestId();

    try {
      return await handler(request);
    } catch (error) {
      // Log error with context
      console.error(`[API Error] ${requestId}:`, {
        method: request.method,
        url: request.url,
        error,
      });

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const errorResponse = toErrorResponse(error);
        errorResponse.error.requestId = requestId;
        return NextResponse.json(errorResponse, { status: 400 });
      }

      // Handle known application errors
      if (isAppError(error)) {
        const errorResponse = toErrorResponse(error);
        errorResponse.error.requestId = requestId;
        return NextResponse.json(errorResponse, { status: error.statusCode });
      }

      // Handle unexpected errors
      const errorResponse = toErrorResponse(error);
      errorResponse.error.requestId = requestId;

      // In development, include stack trace
      if (process.env.NODE_ENV === 'development') {
        errorResponse.error.details = {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        };
      }

      return NextResponse.json(errorResponse, { status: 500 });
    }
  };
}

/**
 * Require validation wrapper for API routes
 * Wraps a Zod schema parser with error handling
 */
export function withValidation<T extends object>(
  schema: {
    parse: (data: unknown) => T;
  },
  handler: (data: T, request: NextRequest) => Promise<NextResponse>
): ApiHandler {
  return async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validated = schema.parse(body);
      return await handler(validated, request);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse = toErrorResponse(error);
        return NextResponse.json(errorResponse, { status: 400 });
      }
      throw error;
    }
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Return a standardized success response
 */
export function successResponse<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({
    success: true,
    data,
    ...(meta && { meta }),
  });
}

/**
 * Return a standardized error response
 */
export function errorResponse(
  code: string,
  message: string,
  statusCode: number = 500,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status: statusCode }
  );
}

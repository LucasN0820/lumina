import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { logger } from '../lib/logger.js';

export class AppError extends Error {
  constructor(
    message: string,
    readonly status: ContentfulStatusCode = 400,
    readonly code = 'BAD_REQUEST',
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler: ErrorHandler = (error, context) => {
  const isAppError = error instanceof AppError;
  const status: ContentfulStatusCode = isAppError ? error.status : 500;
  const code = isAppError ? error.code : 'INTERNAL_SERVER_ERROR';
  const message = isAppError ? error.message : 'Internal server error.';

  logger.error('Request failed.', {
    code,
    error: error.message,
    method: context.req.method,
    path: context.req.path,
    status,
  });

  return context.json(
    {
      ok: false,
      error: {
        code,
        message,
      },
    },
    status,
  );
};

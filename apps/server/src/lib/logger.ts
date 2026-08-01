type LogContext = Record<string, unknown>;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function getErrorLogContext(error: unknown): LogContext {
  const context: LogContext = {
    error: error instanceof Error ? sanitizeErrorMessage(error.message) : 'Unknown error.',
  };

  appendErrorDetails(context, error, 'error');
  if (error && typeof error === 'object' && 'cause' in error) {
    appendErrorDetails(context, error.cause, 'cause');
  }

  return context;
}

function write(level: LogLevel, message: string, context: LogContext = {}): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  const output = JSON.stringify(entry);

  if (level === 'error') {
    console.error(output);
    return;
  }

  console.log(output);
}

export const logger = {
  debug(message: string, context?: LogContext) {
    write('debug', message, context);
  },
  info(message: string, context?: LogContext) {
    write('info', message, context);
  },
  warn(message: string, context?: LogContext) {
    write('warn', message, context);
  },
  error(message: string, context?: LogContext) {
    write('error', message, context);
  },
};

function appendErrorDetails(context: LogContext, error: unknown, prefix: string): void {
  if (!error || typeof error !== 'object') {
    return;
  }

  if (error instanceof Error) {
    context[`${prefix}Name`] = error.name;
    context[`${prefix}Message`] = sanitizeErrorMessage(error.message);
  }

  const code = readString(error, 'code');
  if (code) {
    context[`${prefix}Code`] = code;
  }

  const metadata = '$metadata' in error ? error.$metadata : undefined;
  if (!metadata || typeof metadata !== 'object') {
    return;
  }

  const httpStatusCode = readNumber(metadata, 'httpStatusCode');
  const requestId = readString(metadata, 'requestId');
  if (httpStatusCode !== undefined) {
    context.httpStatusCode = httpStatusCode;
  }
  if (requestId) {
    context.requestId = requestId;
  }
}

function readNumber(value: object, key: string): number | undefined {
  if (!(key in value)) {
    return undefined;
  }

  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === 'number' ? candidate : undefined;
}

function readString(value: object, key: string): string | undefined {
  if (!(key in value)) {
    return undefined;
  }

  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === 'string' && candidate ? candidate : undefined;
}

function sanitizeErrorMessage(message: string): string {
  return message.replace(/https?:\/\/\S+/giu, '[redacted-url]');
}

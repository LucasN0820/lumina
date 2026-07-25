type LogContext = Record<string, unknown>;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

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

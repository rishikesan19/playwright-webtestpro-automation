import { env, type LogLevel } from '@config/env';

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: unknown): void;
}

/**
 * Minimal levelled logger. Output goes to stdout/stderr, which Playwright captures per test
 * and shows in the HTML report alongside the failing step.
 */
export function createLogger(scope: string): Logger {
  const write = (level: LogLevel, message: string): void => {
    if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[env.logLevel]) return;
    const line = `${new Date().toISOString()} [${level.toUpperCase()}] [${scope}] ${message}\n`;
    (level === 'error' || level === 'warn' ? process.stderr : process.stdout).write(line);
  };

  return {
    debug: (message) => write('debug', message),
    info: (message) => write('info', message),
    warn: (message) => write('warn', message),
    error: (message, error) =>
      write('error', error instanceof Error ? `${message}: ${error.message}` : message),
  };
}

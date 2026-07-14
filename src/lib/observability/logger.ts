type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
}

/**
 * Minimalistische gestructureerde logger. Schrijft JSON zodat logs
 * machineleesbaar zijn (Vercel/Sentry). Geen PII loggen.
 *
 * In de observability-wave wordt hier Sentry-forwarding aan gekoppeld
 * en een correlatie-id uit `proxy.ts` meegegeven.
 */
function write(level: LogLevel, message: string, context?: LogContext): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context } : {}),
  };

  const serialized = JSON.stringify(entry);

  if (level === "error") {
    console.error(serialized);
  } else if (level === "warn") {
    console.warn(serialized);
  } else {
    console.warn(serialized);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) =>
    process.env.NODE_ENV !== "production" ? write("debug", message, context) : undefined,
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context),
};

export type Logger = typeof logger;

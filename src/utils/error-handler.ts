/**
 * Error Handler Utility
 * Provides retry logic with exponential backoff and timeout wrappers.
 */

export enum ErrorCodes {
  RETRY_EXHAUSTED = 'RETRY_EXHAUSTED',
  TIMEOUT = 'TIMEOUT',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
  AUTH_FAILED = 'AUTH_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

export class ReviewError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCodes,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ReviewError';
  }
}

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Wraps an async function with exponential backoff retry logic.
 *
 * Algorithm:
 *   attempt 1: wait delayMs * 2^0 + jitter
 *   attempt 2: wait delayMs * 2^1 + jitter
 *   attempt 3: wait delayMs * 2^2 + jitter
 *   ...until maxRetries exhausted, then throw ReviewError(RETRY_EXHAUSTED)
 *
 * Jitter (0–100ms random) prevents thundering herd when many clients retry simultaneously.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, onRetry } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt > maxRetries) {
        // All retries exhausted
        break;
      }

      // Exponential backoff: delayMs * 2^(attempt-1)
      const backoff = delayMs * Math.pow(2, attempt - 1);
      // Jitter: random 0–100ms to spread out retries
      const jitter = Math.floor(Math.random() * 100);
      const waitTime = backoff + jitter;

      if (onRetry) {
        onRetry(attempt, error);
      }

      // Wrap setTimeout in a Promise for async/await compatibility
      await new Promise<void>((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new ReviewError(
    `Operation failed after ${maxRetries} retries: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
    ErrorCodes.RETRY_EXHAUSTED,
    lastError
  );
}

/**
 * Wraps an async function with a timeout using Promise.race.
 * Whichever resolves/rejects first "wins" the race.
 */
export async function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () =>
        reject(
          new ReviewError(
            `Operation timed out after ${timeoutMs}ms`,
            ErrorCodes.TIMEOUT
          )
        ),
      timeoutMs
    )
  );

  return Promise.race([fn(), timeoutPromise]);
}

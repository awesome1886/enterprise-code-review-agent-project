/**
 * Rate Limiter Utility
 * Token bucket algorithm with a 60-second sliding window.
 * Prevents API throttling by enforcing requests-per-minute,
 * tokens-per-minute, and concurrent request limits.
 */

export interface RateLimitConfig {
  requestsPerMinute: number;
  tokensPerMinute: number;
  maxConcurrent: number;
}

export interface RequestRecord {
  timestamp: number;
  tokens: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  requestsPerMinute: 50,
  tokensPerMinute: 40000,
  maxConcurrent: 5,
};

const WINDOW_MS = 60_000; // 60-second sliding window

export class RateLimiter {
  private config: RateLimitConfig;
  private requestHistory: RequestRecord[] = [];
  private activeRequests = 0;
  private waitQueue: Array<() => void> = [];

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Remove records older than 60 seconds from the sliding window.
   * This is the foundation of the sliding window algorithm.
   */
  pruneOldRecords(): void {
    const cutoff = Date.now() - WINDOW_MS;
    this.requestHistory = this.requestHistory.filter(
      (record) => record.timestamp > cutoff
    );
  }

  /**
   * Check if a new request can proceed immediately without waiting.
   * All three conditions must be satisfied:
   *   1. activeRequests < maxConcurrent
   *   2. requests in last 60s < requestsPerMinute
   *   3. tokens in last 60s + estimatedTokens <= tokensPerMinute
   */
  canProceed(estimatedTokens = 0): boolean {
    this.pruneOldRecords();

    const requestsInWindow = this.requestHistory.length;
    const tokensInWindow = this.requestHistory.reduce((sum, r) => sum + r.tokens, 0);

    return (
      this.activeRequests < this.config.maxConcurrent &&
      requestsInWindow < this.config.requestsPerMinute &&
      tokensInWindow + estimatedTokens <= this.config.tokensPerMinute
    );
  }

  /**
   * Wait for a concurrent request slot to open up.
   * Adds a resolve callback to the queue; release() will call it.
   */
  waitForSlot(): Promise<void> {
    if (this.activeRequests < this.config.maxConcurrent) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  /**
   * Wait until rate limits allow the request to proceed.
   * Loops while canProceed() returns false, sleeping between checks.
   */
  async waitForRateLimit(estimatedTokens = 0): Promise<void> {
    while (!this.canProceed(estimatedTokens)) {
      // Calculate how long until the oldest record expires
      const oldest = this.requestHistory[0];
      const waitMs = oldest
        ? Math.max(0, oldest.timestamp + WINDOW_MS - Date.now()) + 100
        : 1000;

      await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
    }
  }

  /**
   * Main entry point: acquire a slot before making an API call.
   * 1. Wait for a concurrent slot
   * 2. Wait for rate limits to allow the request
   * 3. Increment activeRequests and record the request
   */
  async acquire(estimatedTokens = 0): Promise<void> {
    await this.waitForSlot();
    await this.waitForRateLimit(estimatedTokens);

    this.activeRequests++;
    this.requestHistory.push({
      timestamp: Date.now(),
      tokens: estimatedTokens,
    });
  }

  /**
   * Release a concurrent slot after an API call completes.
   * Notifies the next waiter in the queue if one exists.
   */
  release(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);

    const next = this.waitQueue.shift();
    if (next) {
      next();
    }
  }

  /** Returns current stats for debugging. */
  getStats() {
    this.pruneOldRecords();
    return {
      activeRequests: this.activeRequests,
      requestsInWindow: this.requestHistory.length,
      tokensInWindow: this.requestHistory.reduce((s, r) => s + r.tokens, 0),
      queueLength: this.waitQueue.length,
    };
  }
}

export const rateLimiter = new RateLimiter();

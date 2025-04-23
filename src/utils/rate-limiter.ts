export class RateLimiter {
  private requestTimes: number[] = [];
  private readonly requestsPerMinute: number;
  private readonly timeWindow: number;

  constructor(requestsPerMinute: number, timeWindowMs = 60000) {
    this.requestsPerMinute = requestsPerMinute;
    this.timeWindow = timeWindowMs;
  }

  async waitForNextSlot(): Promise<void> {
    const now = Date.now();
    // Remove requests older than the time window
    this.requestTimes = this.requestTimes.filter((time) => now - time < this.timeWindow);

    if (this.requestTimes.length >= this.requestsPerMinute) {
      // Wait until the oldest request is more than the time window old
      const oldestRequest = this.requestTimes[0] ?? now;
      const waitTime = Math.max(0, this.timeWindow - (now - oldestRequest));
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.requestTimes.push(now);
  }
}

export type RetryOptions = {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
};

const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const retryOptions = { ...defaultRetryOptions, ...options };
  let lastError: Error | null = null;
  let delay = retryOptions.initialDelay;

  for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === retryOptions.maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay for next attempt, but don't exceed maxDelay
      delay = Math.min(delay * retryOptions.backoffFactor, retryOptions.maxDelay);
    }
  }

  throw new Error(
    `Operation failed after ${retryOptions.maxRetries} retries. Last error: ${lastError?.message}`
  );
}

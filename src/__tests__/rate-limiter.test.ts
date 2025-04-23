import { beforeEach, describe, expect, test } from 'bun:test';
import { RateLimiter, withRetry } from '../utils/rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter(2, 500); // 2 requests per 500ms for testing
  });

  test('should allow requests within rate limit', async () => {
    const startTime = Date.now();
    
    await rateLimiter.waitForNextSlot();
    await rateLimiter.waitForNextSlot();
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(100); // Should be almost instant
  });

  test('should delay requests that exceed rate limit', async () => {
    const startTime = Date.now();
    
    // Make two requests quickly
    await rateLimiter.waitForNextSlot();
    await rateLimiter.waitForNextSlot();
    
    // Third request should be delayed
    await rateLimiter.waitForNextSlot();
    
    const duration = Date.now() - startTime;
    // Should have waited at least 100ms but less than the full time window
    expect(duration).toBeGreaterThan(100);
    expect(duration).toBeLessThan(600);
  });
});

describe('withRetry', () => {
  test('should retry failed operations', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return 'success';
    };

    const result = await withRetry(operation, {
      maxRetries: 3,
      initialDelay: 10,
      maxDelay: 100,
      backoffFactor: 2,
    });

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  test('should throw after max retries', async () => {
    const operation = async () => {
      throw new Error('Persistent failure');
    };

    await expect(
      withRetry(operation, {
        maxRetries: 2,
        initialDelay: 10,
        maxDelay: 100,
        backoffFactor: 2,
      })
    ).rejects.toThrow('Operation failed after 2 retries');
  });

  test('should use exponential backoff', async () => {
    const delays: number[] = [];
    const startTime = Date.now();
    let attempts = 0;

    const operation = async () => {
      attempts++;
      if (attempts < 3) {
        delays.push(Date.now() - startTime);
        throw new Error('Temporary failure');
      }
      delays.push(Date.now() - startTime);
      return 'success';
    };

    await withRetry(operation, {
      maxRetries: 3,
      initialDelay: 50,
      maxDelay: 200,
      backoffFactor: 2,
    });

    // Check that delays between attempts are increasing
    for (let i = 1; i < delays.length; i++) {
      const prevDelay = delays[i - 1];
      const currentDelay = delays[i];
      if (prevDelay !== undefined && currentDelay !== undefined) {
        expect(currentDelay - prevDelay).toBeGreaterThan(40); // Allow some margin for timing
      }
    }
  });
}); 
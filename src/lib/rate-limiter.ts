export interface RateLimiterOptions {
  maxTokens: number;
  refillRate: number; // tokens to add per interval
  refillIntervalMs: number;
}

export class RateLimiter {
  private buckets = new Map<string, { tokens: number; lastRefilled: number }>();
  private maxTokens: number;
  private refillRate: number;
  private refillIntervalMs: number;

  constructor(options: RateLimiterOptions) {
    this.maxTokens = options.maxTokens;
    this.refillRate = options.refillRate;
    this.refillIntervalMs = options.refillIntervalMs;
  }

  public consume(key: string, tokens = 1): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: this.maxTokens, lastRefilled: now };
      this.buckets.set(key, bucket);
    }

    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefilled;
    const refills = Math.floor(timePassed / this.refillIntervalMs);
    
    if (refills > 0) {
      bucket.tokens = Math.min(this.maxTokens, bucket.tokens + refills * this.refillRate);
      bucket.lastRefilled = bucket.lastRefilled + refills * this.refillIntervalMs;
    }

    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      return { allowed: true };
    }

    // Calculate retryAfter in seconds
    const missingTokens = tokens - bucket.tokens;
    const nextRefill = bucket.lastRefilled + this.refillIntervalMs;
    const msUntilNextRefill = Math.max(0, nextRefill - now);
    const retryAfter = Math.ceil((msUntilNextRefill + (Math.ceil(missingTokens / this.refillRate) - 1) * this.refillIntervalMs) / 1000);

    return {
      allowed: false,
      retryAfter: Math.max(1, retryAfter),
    };
  }
}

export function createApiRateLimiter() {
  return new RateLimiter({
    maxTokens: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    refillRate: 10,
    refillIntervalMs: 6000, // Refill 10 tokens every 6 seconds (100 per minute)
  });
}

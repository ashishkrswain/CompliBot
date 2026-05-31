import { Context, Next } from "hono";
import Redis from "ioredis";

const REDIS_URL = process.env["REDIS_URL"] ?? "redis://localhost:6379";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 3 });
  }
  return redis;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 200,
  keyPrefix: "rl:",
};

export function rateLimitMiddleware(config: Partial<RateLimitConfig> = {}) {
  const { windowMs, maxRequests, keyPrefix } = { ...DEFAULT_CONFIG, ...config };
  const windowSec = Math.ceil(windowMs / 1000);

  return async (c: Context, next: Next): Promise<Response | void> => {
    const identifier = c.get("userId") ?? c.req.header("X-Forwarded-For") ?? "anonymous";
    const key = `${keyPrefix}${identifier}:${Math.floor(Date.now() / windowMs)}`;

    try {
      const client = getRedis();
      const current = await client.incr(key);

      if (current === 1) {
        await client.expire(key, windowSec);
      }

      c.header("X-RateLimit-Limit", String(maxRequests));
      c.header("X-RateLimit-Remaining", String(Math.max(0, maxRequests - current)));

      if (current > maxRequests) {
        return c.json(
          { error: "Rate limit exceeded. Please try again later." },
          429
        );
      }
    } catch {
      // If Redis is down, allow the request through (fail open)
    }

    await next();
  };
}

export function reportGenerationLimiter() {
  return rateLimitMiddleware({
    windowMs: 3_600_000, // 1 hour
    maxRequests: 50,
    keyPrefix: "rl:report:",
  });
}

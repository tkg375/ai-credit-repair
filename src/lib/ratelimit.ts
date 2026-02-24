import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createLimiters() {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  return {
    free: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "24 h"),
      prefix: "rl:upload:free",
    }),
    pro: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "24 h"),
      prefix: "rl:upload:pro",
    }),
  };
}

let _limiters: ReturnType<typeof createLimiters> | null = null;

export function getLimiters() {
  if (!_limiters) _limiters = createLimiters();
  return _limiters;
}

import { describe, expect, it } from "vitest";
import { clientIp, createRateLimiter } from "@/lib/chat/rate-limit";

const MINUTE = 60_000;

function setup(options: { maxKeys?: number } = {}) {
  let time = 0;
  const limiter = createRateLimiter({
    limit: 3,
    windowMs: 10 * MINUTE,
    now: () => time,
    ...options,
  });
  return {
    limiter,
    advance(ms: number) {
      time += ms;
    },
  };
}

describe("rate limiter (PLAN.md §6.2)", () => {
  it("allows up to the limit, then blocks", () => {
    const { limiter } = setup();
    expect(limiter.check("1.2.3.4")).toEqual({ ok: true, remaining: 2 });
    expect(limiter.check("1.2.3.4")).toEqual({ ok: true, remaining: 1 });
    expect(limiter.check("1.2.3.4")).toEqual({ ok: true, remaining: 0 });
    expect(limiter.check("1.2.3.4")).toEqual({ ok: false, retryAfterSeconds: 600 });
  });

  it("says how long until the oldest request leaves the window", () => {
    const { limiter, advance } = setup();
    limiter.check("a");
    advance(4 * MINUTE);
    limiter.check("a");
    limiter.check("a");
    expect(limiter.check("a")).toEqual({ ok: false, retryAfterSeconds: 6 * 60 });
  });

  it("resets after the window", () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 3; i++) limiter.check("a");
    expect(limiter.check("a").ok).toBe(false);
    advance(10 * MINUTE);
    expect(limiter.check("a")).toEqual({ ok: true, remaining: 2 });
  });

  it("doesn't count blocked requests against the visitor", () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 3; i++) limiter.check("a");
    for (let i = 0; i < 5; i++) limiter.check("a");
    advance(10 * MINUTE);
    expect(limiter.check("a")).toEqual({ ok: true, remaining: 2 });
  });

  it("keeps each visitor's allowance separate", () => {
    const { limiter } = setup();
    for (let i = 0; i < 3; i++) limiter.check("a");
    expect(limiter.check("a").ok).toBe(false);
    expect(limiter.check("b").ok).toBe(true);
  });

  it("forgets expired visitors once it tracks too many", () => {
    const { limiter, advance } = setup({ maxKeys: 2 });
    limiter.check("a");
    limiter.check("b");
    advance(10 * MINUTE);
    limiter.check("c");
    expect(limiter.size).toBe(1);
  });
});

describe("clientIp", () => {
  it("takes the first x-forwarded-for address", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe(
      "203.0.113.7",
    );
  });

  it("falls back to x-real-ip, then to one shared key", () => {
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});

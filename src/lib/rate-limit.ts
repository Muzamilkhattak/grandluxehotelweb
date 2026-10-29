import fs from "fs/promises";
import path from "path";
import { headers } from "next/headers";

interface RateLimitRecord {
  attempts: number[]; // timestamps of failed attempts
  lockedUntil: number | null; // timestamp until locked
}

interface RateLimitStore {
  [key: string]: RateLimitRecord;
}

const STORE_PATH = path.join(process.cwd(), "src", "data", "rate-limit-store.json");

// In-memory cache for ultra-fast checks
let memoryStore: RateLimitStore | null = null;
let isStoreLoaded = false;

async function loadStore(): Promise<RateLimitStore> {
  if (isStoreLoaded && memoryStore) {
    return memoryStore;
  }
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    memoryStore = JSON.parse(raw);
  } catch {
    memoryStore = {};
  }
  isStoreLoaded = true;
  return memoryStore!;
}

async function persistStore(): Promise<void> {
  if (!memoryStore) return;
  try {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch {
    // Disk write fallback
  }
}

/**
 * Extracts client IP from Next.js server headers
 */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    const realIp = headersList.get("x-real-ip");
    if (realIp) return realIp.trim();
    const cfIp = headersList.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();
  } catch {
    // Fallback if called outside request context
  }
  return "127.0.0.1";
}

/**
 * Format milliseconds into human friendly readable string
 */
export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return "a moment";
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export interface RateLimitStatus {
  isLimited: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
  errorMessage?: string;
}

/**
 * Check if the given action/key is currently rate-limited
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 mins default
): Promise<RateLimitStatus> {
  const store = await loadStore();
  const now = Date.now();
  const record = store[key];

  if (!record) {
    return {
      isLimited: false,
      remainingAttempts: maxAttempts,
      retryAfterSeconds: 0,
    };
  }

  // 1. Check if currently locked out
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      isLimited: true,
      remainingAttempts: 0,
      retryAfterSeconds,
      errorMessage: `Too many attempts. Access is locked for security. Please try again in ${formatRemainingTime(
        retryAfterSeconds
      )}.`,
    };
  }

  // 2. Clean up attempts older than window
  const activeAttempts = (record.attempts || []).filter((t) => now - t < windowMs);
  record.attempts = activeAttempts;

  // 3. Check if attempts exceed maximum allowed
  if (activeAttempts.length >= maxAttempts) {
    const oldest = activeAttempts[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      isLimited: true,
      remainingAttempts: 0,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
      errorMessage: `Too many attempts. Please try again in ${formatRemainingTime(
        Math.max(1, retryAfterSeconds)
      )}.`,
    };
  }

  return {
    isLimited: false,
    remainingAttempts: maxAttempts - activeAttempts.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Record a failed attempt. If threshold reached, activates lockout.
 */
export async function recordFailedAttempt(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000,
  lockoutMs: number = 15 * 60 * 1000
): Promise<RateLimitStatus> {
  const store = await loadStore();
  const now = Date.now();

  if (!store[key]) {
    store[key] = { attempts: [], lockedUntil: null };
  }

  const record = store[key];
  // Filter attempts in window
  record.attempts = (record.attempts || []).filter((t) => now - t < windowMs);
  record.attempts.push(now);

  let isLimited = false;
  let retryAfterSeconds = 0;
  let remainingAttempts = Math.max(0, maxAttempts - record.attempts.length);

  if (record.attempts.length >= maxAttempts) {
    record.lockedUntil = now + lockoutMs;
    isLimited = true;
    retryAfterSeconds = Math.ceil(lockoutMs / 1000);
    remainingAttempts = 0;
  }

  await persistStore();

  return {
    isLimited,
    remainingAttempts,
    retryAfterSeconds,
    errorMessage: isLimited
      ? `Too many failed attempts. Access locked for ${formatRemainingTime(
          retryAfterSeconds
        )}. Please wait before trying again.`
      : `${remainingAttempts} attempt${
          remainingAttempts === 1 ? "" : "s"
        } remaining before account lockout.`,
  };
}

/**
 * Reset / clear rate limit record upon successful login
 */
export async function resetRateLimit(key: string): Promise<void> {
  const store = await loadStore();
  if (store[key]) {
    delete store[key];
    await persistStore();
  }
}

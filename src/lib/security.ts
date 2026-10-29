import { headers } from "next/headers";

/**
 * List of known automated HTTP library and bot signatures
 */
const KNOWN_BOT_USER_AGENTS = [
  "curl/",
  "python-requests",
  "aiohttp",
  "scrapy",
  "libwww-perl",
  "go-http-client",
  "postmanruntime",
  "httpclient",
  "wget/",
  "mechanize",
  "node-fetch",
  "urllib",
  "headlesschrome",
  "phantomjs",
  "selenium",
];

/**
 * List of trivially guessable passwords to reject on registration
 */
const COMMON_WEAK_PASSWORDS = new Set([
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password123",
  "password1234",
  "qwerty123",
  "admin123",
  "hotel123",
  "welcome123",
  "oslo1234",
  "grandluxe",
  "grandluxe123",
]);

/**
 * Check if the request comes from a known malicious scraping or bot tool
 */
export async function isSuspiciousBotRequest(): Promise<boolean> {
  try {
    const headersList = await headers();
    const ua = (headersList.get("user-agent") || "").toLowerCase();
    
    // Check known bot signatures
    if (KNOWN_BOT_USER_AGENTS.some((bot) => ua.includes(bot))) {
      return true;
    }
  } catch {
    // Fail open if headers cannot be accessed
  }
  return false;
}

/**
 * Verify honeypot field. Real users never fill this field.
 * If non-empty, it's an automated bot attack.
 */
export function verifyHoneypot(honeypotValue: string | null | undefined): boolean {
  if (!honeypotValue) return true; // clean
  return honeypotValue.trim().length === 0;
}

/**
 * Verify form submission speed. Real users take at least 800ms
 * to view, type, and submit a login or signup form.
 */
export function verifySubmissionTiming(renderedTimestampStr: string | null | undefined, minDelayMs = 800): boolean {
  if (!renderedTimestampStr) return true; // fallback if client disabled JS
  const renderedAt = parseInt(renderedTimestampStr, 10);
  if (isNaN(renderedAt)) return true;

  const now = Date.now();
  const elapsed = now - renderedAt;

  // If submitted faster than humanly possible (e.g. 50ms) or timestamp is in the future
  if (elapsed < minDelayMs || elapsed > 24 * 60 * 60 * 1000) {
    return false;
  }
  return true;
}

/**
 * Strict email validation & canonicalization
 */
export function sanitizeAndValidateEmail(rawEmail: string): { isValid: boolean; email: string; error?: string } {
  const email = (rawEmail || "").trim().toLowerCase();

  if (!email) {
    return { isValid: false, email: "", error: "Email address is required." };
  }

  if (email.length > 128) {
    return { isValid: false, email: "", error: "Email address is too long (max 128 characters)." };
  }

  // RFC 5322 compliant regex for safe emails
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, email: "", error: "Please provide a valid email address." };
  }

  return { isValid: true, email };
}

/**
 * Sanitize user name to prevent XSS and script injections
 */
export function sanitizeFullName(rawName: string): { isValid: boolean; name: string; error?: string } {
  if (!rawName) {
    return { isValid: false, name: "", error: "Full name is required." };
  }

  // Strip HTML tags and control characters
  const clean = rawName
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"'/\\;`]/g, "")
    .trim();

  if (clean.length < 2) {
    return { isValid: false, name: "", error: "Name must be at least 2 characters." };
  }

  if (clean.length > 70) {
    return { isValid: false, name: "", error: "Name is too long (max 70 characters)." };
  }

  return { isValid: true, name: clean };
}

/**
 * Sanitize phone number safely
 */
export function sanitizePhone(rawPhone: string): string {
  if (!rawPhone) return "";
  // Keep only digits and standard telecom punctuation
  return rawPhone.replace(/[^0-9+\s\-()]/g, "").trim().slice(0, 25);
}

/**
 * Password strength and weak password dictionary verification
 */
export function validatePasswordStrength(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: "Password is required." };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long for security." };
  }

  if (password.length > 72) {
    return { isValid: false, error: "Password is too long (max 72 characters)." };
  }

  if (COMMON_WEAK_PASSWORDS.has(password.toLowerCase())) {
    return { isValid: false, error: "This password is too common and easily guessed. Please choose a stronger password." };
  }

  return { isValid: true };
}

/**
 * Introduce a minimal constant delay floor to equalize response timing,
 * mitigating timing attacks (attacker measuring execution duration to infer if user exists).
 */
export async function equalizeTiming(startTime: number, targetMs = 250): Promise<void> {
  const elapsed = Date.now() - startTime;
  const remaining = targetMs - elapsed;
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}

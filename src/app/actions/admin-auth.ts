"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  getExpectedAdminCredentials,
  signAdminToken,
  verifyAdminToken,
} from "@/lib/admin-auth";
import {
  checkRateLimit,
  getClientIp,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/rate-limit";

export interface LoginResult {
  success: boolean;
  error?: string;
  isLocked?: boolean;
  remainingAttempts?: number;
  retryAfterSeconds?: number;
}

export async function loginAdminAction(formData: FormData): Promise<LoginResult> {
  const username = (formData.get("username") as string || "").trim();
  const password = (formData.get("password") as string || "").trim();

  const clientIp = await getClientIp();
  const rateLimitKey = `admin_login:${clientIp}`;

  // 1. Enforce rate limit check before processing
  const limitStatus = await checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
  if (limitStatus.isLimited) {
    return {
      success: false,
      error: limitStatus.errorMessage,
      isLocked: true,
      retryAfterSeconds: limitStatus.retryAfterSeconds,
      remainingAttempts: 0,
    };
  }

  if (!username || !password) {
    return {
      success: false,
      error: "Please enter both username and password.",
    };
  }

  const credentials = getExpectedAdminCredentials();

  // Secure comparison
  if (username !== credentials.username || password !== credentials.password) {
    // Record failed attempt into rate-limiting store
    const failRecord = await recordFailedAttempt(rateLimitKey, 5, 15 * 60 * 1000, 15 * 60 * 1000);
    // Artificial small delay to prevent brute-force timing analysis
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: false,
      error: failRecord.isLimited
        ? failRecord.errorMessage
        : `Invalid username or password. ${failRecord.remainingAttempts} attempt${failRecord.remainingAttempts === 1 ? "" : "s"} remaining before temporary lockout.`,
      isLocked: failRecord.isLimited,
      remainingAttempts: failRecord.remainingAttempts,
      retryAfterSeconds: failRecord.retryAfterSeconds,
    };
  }

  // Reset rate limiting key upon successful admin authentication
  await resetRateLimit(rateLimitKey);

  // Generate secure HMAC token valid for 24 hours
  const token = await signAdminToken(username, 24 * 60 * 60 * 1000);

  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return { success: true };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

export async function verifyAdminSessionServer(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (!cookie?.value) return false;

    const payload = await verifyAdminToken(cookie.value);
    return payload !== null;
  } catch {
    return false;
  }
}

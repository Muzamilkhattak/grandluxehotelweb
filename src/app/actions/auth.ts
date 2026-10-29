"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  checkRateLimit,
  getClientIp,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/rate-limit";
import {
  isSuspiciousBotRequest,
  verifyHoneypot,
  verifySubmissionTiming,
  sanitizeAndValidateEmail,
  sanitizeFullName,
  sanitizePhone,
  validatePasswordStrength,
  equalizeTiming,
} from "@/lib/security";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
  isLocked?: boolean;
  retryAfterSeconds?: number;
  requiresConfirmation?: boolean;
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const startTime = Date.now();

  // 1. Anti-Bot Defense Layer
  if (await isSuspiciousBotRequest()) {
    await equalizeTiming(startTime, 500);
    return { success: false, error: "Automated activity detected. Access restricted." };
  }

  // Honeypot trap check
  const honeypot = formData.get("hotel_hp_field") as string;
  if (!verifyHoneypot(honeypot)) {
    await equalizeTiming(startTime, 600);
    return { success: false, error: "Security check failed. Please refresh and try again." };
  }

  // Time-to-submit verification (blocks automated submission scripts)
  const formTs = formData.get("_form_ts") as string;
  if (!verifySubmissionTiming(formTs, 600)) {
    await equalizeTiming(startTime, 500);
    return { success: false, error: "Form submitted unusually fast. Please try again." };
  }

  // 2. Input Sanitization & Validation
  const rawEmail = (formData.get("email") as string || "");
  const password = formData.get("password") as string || "";

  const emailCheck = sanitizeAndValidateEmail(rawEmail);
  if (!emailCheck.isValid) {
    await equalizeTiming(startTime, 250);
    return { success: false, error: emailCheck.error || "Valid email is required." };
  }
  const email = emailCheck.email;

  if (!password) {
    await equalizeTiming(startTime, 250);
    return { success: false, error: "Password is required." };
  }

  const clientIp = await getClientIp();
  const ipRateLimitKey = `user_login_ip:${clientIp}`;
  const targetRateLimitKey = `user_login_target:${email}`;

  // 3. Dual-Layer Rate Limiting (Prevents IP brute force & Distributed Credential Stuffing)
  const [ipLimit, targetLimit] = await Promise.all([
    checkRateLimit(ipRateLimitKey, 5, 15 * 60 * 1000),
    checkRateLimit(targetRateLimitKey, 5, 15 * 60 * 1000),
  ]);

  if (ipLimit.isLimited) {
    await equalizeTiming(startTime, 300);
    return {
      success: false,
      error: ipLimit.errorMessage,
      isLocked: true,
      retryAfterSeconds: ipLimit.retryAfterSeconds,
    };
  }

  if (targetLimit.isLimited) {
    await equalizeTiming(startTime, 300);
    return {
      success: false,
      error: `Too many login attempts on this account. Locked for security. Try again in ${targetLimit.retryAfterSeconds}s.`,
      isLocked: true,
      retryAfterSeconds: targetLimit.retryAfterSeconds,
    };
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Handle unconfirmed email automatically if project required confirmation
  if (error && error.message.toLowerCase().includes("email not confirmed")) {
    const adminClient = createAdminClient();
    if (adminClient) {
      try {
        const { data: userList } = await adminClient.auth.admin.listUsers();
        const existing = userList?.users?.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
        if (existing) {
          await adminClient.auth.admin.updateUserById(existing.id, {
            email_confirm: true,
          });
          // Retry sign in
          const retry = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (!retry.error) {
            error = null;
            data = retry.data;
          }
        }
      } catch (adminErr) {
        console.error("Auto-confirm error during login:", adminErr);
      }
    }
  }

  if (error) {
    // Record failed attempt in both IP and Target Account stores
    const [ipFailRecord] = await Promise.all([
      recordFailedAttempt(ipRateLimitKey, 5, 15 * 60 * 1000, 15 * 60 * 1000),
      recordFailedAttempt(targetRateLimitKey, 5, 15 * 60 * 1000, 15 * 60 * 1000),
    ]);

    await equalizeTiming(startTime, 350);

    const friendlyError = error.message.toLowerCase().includes("invalid login credentials")
      ? "Invalid email or password. Please verify your credentials."
      : error.message;

    return {
      success: false,
      error: ipFailRecord.isLimited
        ? ipFailRecord.errorMessage
        : `${friendlyError} (${ipFailRecord.remainingAttempts} attempt${ipFailRecord.remainingAttempts === 1 ? "" : "s"} remaining before lockout).`,
      isLocked: ipFailRecord.isLimited,
      retryAfterSeconds: ipFailRecord.retryAfterSeconds,
    };
  }

  // Clear rate limits upon successful sign-in
  await Promise.all([
    resetRateLimit(ipRateLimitKey),
    resetRateLimit(targetRateLimitKey),
  ]);

  await equalizeTiming(startTime, 300);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signupAction(formData: FormData): Promise<AuthActionResult> {
  const startTime = Date.now();

  // 1. Anti-Bot Defense Layer
  if (await isSuspiciousBotRequest()) {
    await equalizeTiming(startTime, 500);
    return { success: false, error: "Automated activity detected. Access restricted." };
  }

  // Honeypot trap check
  const honeypot = formData.get("hotel_hp_field") as string;
  if (!verifyHoneypot(honeypot)) {
    await equalizeTiming(startTime, 600);
    return { success: false, error: "Security validation failed. Please try again." };
  }

  // Time-to-submit verification
  const formTs = formData.get("_form_ts") as string;
  if (!verifySubmissionTiming(formTs, 800)) {
    await equalizeTiming(startTime, 500);
    return { success: false, error: "Form submitted unusually fast. Please try again." };
  }

  // 2. Strict Input Sanitization & Validation
  const rawEmail = formData.get("email") as string || "";
  const password = formData.get("password") as string || "";
  const rawFullName = formData.get("fullName") as string || "";
  const rawPhone = formData.get("phone") as string || "";

  const nameCheck = sanitizeFullName(rawFullName);
  if (!nameCheck.isValid) {
    await equalizeTiming(startTime, 250);
    return { success: false, error: nameCheck.error };
  }
  const fullName = nameCheck.name;

  const emailCheck = sanitizeAndValidateEmail(rawEmail);
  if (!emailCheck.isValid) {
    await equalizeTiming(startTime, 250);
    return { success: false, error: emailCheck.error };
  }
  const email = emailCheck.email;

  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.isValid) {
    await equalizeTiming(startTime, 250);
    return { success: false, error: passwordCheck.error };
  }

  const phone = sanitizePhone(rawPhone);

  // 3. Signup Rate Limiting (Prevents account creation spam & DB exhaustion)
  const clientIp = await getClientIp();
  const signupLimitKey = `user_signup:${clientIp}`;

  const limitStatus = await checkRateLimit(signupLimitKey, 5, 30 * 60 * 1000);
  if (limitStatus.isLimited) {
    await equalizeTiming(startTime, 300);
    return {
      success: false,
      error: "Too many accounts created from this network. Please try again later.",
      isLocked: true,
      retryAfterSeconds: limitStatus.retryAfterSeconds,
    };
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const adminClient = createAdminClient();

  if (adminClient) {
    // Create user with verified email via Admin client for instant, secure access
    const { data: adminData, error: adminError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone || "",
      },
    });

    if (adminError) {
      await equalizeTiming(startTime, 350);
      if (
        adminError.message.toLowerCase().includes("already registered") ||
        adminError.message.toLowerCase().includes("already exists")
      ) {
        return {
          success: false,
          error: "An account with this email address already exists. Please sign in instead.",
        };
      }
      return { success: false, error: adminError.message };
    }

    // Immediately establish the session on the user's browser
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      await equalizeTiming(startTime, 300);
      return {
        success: false,
        error: `Account created, but sign in failed: ${signInError.message}. Please sign in with your credentials.`,
      };
    }
  } else {
    // Fallback if admin client not available
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || "",
        },
      },
    });

    if (error) {
      await equalizeTiming(startTime, 300);
      return { success: false, error: error.message };
    }

    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      await equalizeTiming(startTime, 300);
      return {
        success: false,
        error: "An account with this email address already exists. Please sign in instead.",
      };
    }

    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        await equalizeTiming(startTime, 300);
        return {
          success: true,
          requiresConfirmation: true,
          message: "Account created! Please check your email to confirm your account, then sign in.",
        };
      }
    }
  }

  // Clear IP rate limit upon successful legitimate account creation
  await resetRateLimit(`user_login_ip:${clientIp}`);
  await resetRateLimit(`user_login_target:${email}`);

  await equalizeTiming(startTime, 350);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteAccountAction() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not logged in" };
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return { success: false, error: "Server error: missing admin privileges" };
  }

  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Log out the user after deletion
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  return { success: true };
}

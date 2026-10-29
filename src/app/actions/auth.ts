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

export interface AuthActionResult {
  success: boolean;
  error?: string;
  message?: string;
  isLocked?: boolean;
  retryAfterSeconds?: number;
  requiresConfirmation?: boolean;
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string || "";

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const clientIp = await getClientIp();
  const rateLimitKey = `user_login:${clientIp}:${email}`;

  // 1. Enforce rate limit check before hitting Supabase
  const limitStatus = await checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
  if (limitStatus.isLimited) {
    return {
      success: false,
      error: limitStatus.errorMessage,
      isLocked: true,
      retryAfterSeconds: limitStatus.retryAfterSeconds,
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
    // Record failed attempt
    const failRecord = await recordFailedAttempt(rateLimitKey, 5, 15 * 60 * 1000, 15 * 60 * 1000);

    const friendlyError = error.message.toLowerCase().includes("invalid login credentials")
      ? "Invalid email or password. Please verify your credentials."
      : error.message;

    return {
      success: false,
      error: failRecord.isLimited
        ? failRecord.errorMessage
        : `${friendlyError} (${failRecord.remainingAttempts} attempt${failRecord.remainingAttempts === 1 ? "" : "s"} remaining before lockout).`,
      isLocked: failRecord.isLimited,
      retryAfterSeconds: failRecord.retryAfterSeconds,
    };
  }

  // Clear rate limit record upon successful sign-in
  await resetRateLimit(rateLimitKey);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signupAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string || "";
  const fullName = (formData.get("fullName") as string || "").trim();
  const phone = (formData.get("phone") as string || "").trim();

  if (!email || !password || !fullName) {
    return { success: false, error: "Full name, email address, and password are required" };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Please enter a valid email address" };
  }

  const clientIp = await getClientIp();
  const signupLimitKey = `user_signup:${clientIp}`;

  // Rate limit: max 10 account signups per 30 minutes per IP
  const limitStatus = await checkRateLimit(signupLimitKey, 10, 30 * 60 * 1000);
  if (limitStatus.isLimited) {
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
    // Create user with verified email via Admin client for instant access
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
      return {
        success: false,
        error: `Account created successfully, but automatic sign in failed: ${signInError.message}. Please sign in manually.`,
      };
    }
  } else {
    // Fallback to standard Supabase signUp if admin client is not available
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
      return { success: false, error: error.message };
    }

    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return {
        success: false,
        error: "An account with this email address already exists. Please sign in instead.",
      };
    }

    // If session wasn't automatically established, try signing in
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        return {
          success: true,
          requiresConfirmation: true,
          message: "Account created! Please check your email to confirm your account, then sign in.",
        };
      }
    }
  }

  // Clear rate limits
  const rateLimitKey = `user_login:${clientIp}:${email}`;
  await resetRateLimit(rateLimitKey);

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

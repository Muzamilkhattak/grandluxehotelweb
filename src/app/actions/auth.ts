"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  checkRateLimit,
  getClientIp,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/rate-limit";

export async function loginAction(formData: FormData) {
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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Record failed attempt
    const failRecord = await recordFailedAttempt(rateLimitKey, 5, 15 * 60 * 1000, 15 * 60 * 1000);

    return {
      success: false,
      error: failRecord.isLimited
        ? failRecord.errorMessage
        : `${error.message}. ${failRecord.remainingAttempts} attempt${failRecord.remainingAttempts === 1 ? "" : "s"} remaining before lockout.`,
      isLocked: failRecord.isLimited,
      retryAfterSeconds: failRecord.retryAfterSeconds,
    };
  }

  // Clear rate limit record upon successful sign-in
  await resetRateLimit(rateLimitKey);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signupAction(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string || "";
  const fullName = (formData.get("fullName") as string || "").trim();
  const phone = (formData.get("phone") as string || "").trim();

  if (!email || !password || !fullName) {
    return { success: false, error: "Email, password, and name are required" };
  }

  const clientIp = await getClientIp();
  const signupLimitKey = `user_signup:${clientIp}`;

  // Rate limit: max 4 account signups per 30 minutes per IP
  const limitStatus = await checkRateLimit(signupLimitKey, 4, 30 * 60 * 1000);
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

  const { error } = await supabase.auth.signUp({
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

  // Record signup attempt to prevent bot floods
  await recordFailedAttempt(signupLimitKey, 4, 30 * 60 * 1000, 30 * 60 * 1000);

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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not logged in" };
  }

  // Create an admin client to delete the user
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Log out the user after deletion
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  return { success: true };
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin login required." };
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId);

  if (!error) {
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { success: true };
  }
  return { success: false, error: error.message };
}

export async function toggleBookingStatus(bookingId: string, currentStatus: string) {
  const newStatus = currentStatus === 'confirmed' ? 'cancelled' : 'confirmed';
  return updateBookingStatus(bookingId, newStatus);
}

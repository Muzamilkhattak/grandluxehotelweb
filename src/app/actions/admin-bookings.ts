"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";
import { sendGuestConfirmation, BookingEmailData } from "@/lib/email";

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin login required." };
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const adminSupabase = createAdminClient();
  const client = adminSupabase || supabase;

  // Use admin client with service role key to bypass RLS and persist update
  const { data: updatedBookings, error } = await client
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)
    .select(`
      *,
      rooms ( title )
    `);

  if (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: error.message };
  }

  if (!updatedBookings || updatedBookings.length === 0) {
    return { success: false, error: "Booking record not found or could not be updated." };
  }

  const bookingData = updatedBookings[0];

  // When admin confirms reservation, automatically send confirmation email with details to guest
  if (newStatus === 'confirmed' && bookingData.guest_email) {
    try {
      const emailData: BookingEmailData = {
        bookingId: bookingData.id,
        guestName: bookingData.guest_name,
        guestEmail: bookingData.guest_email,
        guestPhone: bookingData.guest_phone || '',
        roomName: bookingData.rooms?.title || 'Luxury Suite',
        checkIn: bookingData.check_in,
        checkOut: bookingData.check_out,
        totalNights: bookingData.total_nights,
        totalAmount: bookingData.total_amount || 0,
        notes: bookingData.notes || undefined,
      };

      await sendGuestConfirmation(emailData);
    } catch (emailErr) {
      console.error("Error triggering guest confirmation email on booking status update:", emailErr);
    }
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  revalidatePath("/admin/guests");
  return { success: true, booking: bookingData };
}

export async function toggleBookingStatus(bookingId: string, currentStatus: string) {
  const newStatus = currentStatus === 'confirmed' ? 'cancelled' : 'confirmed';
  return updateBookingStatus(bookingId, newStatus);
}

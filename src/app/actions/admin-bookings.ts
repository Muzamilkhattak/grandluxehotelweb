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

  let { error } = await supabase
    .from('bookings')
    .update({ status: newStatus })
    .eq('id', bookingId);

  if (error) {
    const adminSupabase = createAdminClient();
    if (adminSupabase) {
      const res = await adminSupabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);
      error = res.error;
    }
  }

  if (error) {
    return { success: false, error: error.message };
  }

  // When admin confirms reservation, automatically send confirmation email with details to guest
  if (newStatus === 'confirmed') {
    try {
      let bookingData: any = null;
      const { data, error: fetchErr } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms ( title )
        `)
        .eq('id', bookingId)
        .single();

      bookingData = data;
      if (fetchErr && !bookingData) {
        const adminSupabase = createAdminClient();
        if (adminSupabase) {
          const res = await adminSupabase
            .from('bookings')
            .select(`
              *,
              rooms ( title )
            `)
            .eq('id', bookingId)
            .single();
          bookingData = res.data;
        }
      }

      if (bookingData && bookingData.guest_email) {
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

        sendGuestConfirmation(emailData).catch((mailErr) => {
          console.error("Failed to send guest confirmation email:", mailErr);
        });
      }
    } catch (emailErr) {
      console.error("Error triggering guest confirmation email on booking status update:", emailErr);
    }
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: true };
}

export async function toggleBookingStatus(bookingId: string, currentStatus: string) {
  const newStatus = currentStatus === 'confirmed' ? 'cancelled' : 'confirmed';
  return updateBookingStatus(bookingId, newStatus);
}

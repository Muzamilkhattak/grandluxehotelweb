"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendGuestConfirmation, sendAdminAlert } from "@/lib/email";
import { getRoomTotalCount } from "@/utils/room-inventory";

export type BookingPayload = {
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  notes?: string;
};

export async function createBookingAction(payload: BookingPayload) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { roomId, guestName, guestEmail, guestPhone, checkIn, checkOut, notes } = payload;

    // Validation: Required fields
    if (!guestName?.trim()) {
      return { success: false, error: "Guest full name is required." };
    }
    if (!guestEmail?.trim()) {
      return { success: false, error: "Guest email address is required." };
    }
    if (!guestPhone?.trim()) {
      return { success: false, error: "Guest phone number is required." };
    }
    if (!checkIn || !checkOut) {
      return { success: false, error: "Check-in and check-out dates are required." };
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // 1. Validation: Ensure checkOut date is strictly after checkIn date
    if (checkOutDate <= checkInDate) {
      return { success: false, error: "Check-out date must be strictly after the check-in date." };
    }

    // 2. Fetch room details
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      console.error("Error fetching room details:", roomError);
      return { success: false, error: "Room accommodation not found." };
    }

    const totalAvailableRooms = getRoomTotalCount(room);

    // 3. Overlapping active bookings check
    const { data: overlappingBookings, error: overlapError } = await supabase
      .from("bookings")
      .select("id")
      .eq("room_id", roomId)
      .neq("status", "cancelled")
      .lt("check_in", checkOut)
      .gt("check_out", checkIn);

    if (overlapError) {
      console.error("Error verifying room availability:", overlapError);
      return { success: false, error: "Failed to verify room availability." };
    }

    // Check inventory capacity
    if (overlappingBookings && overlappingBookings.length >= totalAvailableRooms) {
      return { 
        success: false, 
        error: `All ${totalAvailableRooms} available room(s) of this suite type are already booked for the selected dates. Please select different dates or another accommodation.` 
      };
    }

    // 4. Calculate total nights and total_amount
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
    const totalNights = Math.ceil(timeDifference / (1000 * 3600 * 24));
    const totalAmount = totalNights * room.price_per_night;

    // 5. Insert booking into bookings table
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        room_id: roomId,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        check_in: checkIn,
        check_out: checkOut,
        total_nights: totalNights,
        notes: notes || null,
        total_amount: totalAmount,
        status: "confirmed",
        payment_status: "pay_on_arrival",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating booking:", insertError.message || insertError);
      return { success: false, error: insertError.message || "Failed to create booking. Please try again." };
    }

    // 6. Dispatch emails asynchronously
    if (booking) {
      const emailData = {
        bookingId: booking.id,
        guestName,
        guestEmail,
        guestPhone,
        roomName: room.title || "Luxury Suite",
        checkIn,
        checkOut,
        totalNights,
        totalAmount,
        notes: notes || undefined,
      };

      Promise.allSettled([
        sendGuestConfirmation(emailData),
        sendAdminAlert(emailData)
      ]).catch(console.error);
    }

    // 7. Call revalidatePath
    revalidatePath("/admin/bookings");
    revalidatePath("/rooms");

    return { success: true, booking };
  } catch (error) {
    console.error("Unexpected error during booking creation:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

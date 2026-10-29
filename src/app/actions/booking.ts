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

    const { data: { user } } = await supabase.auth.getUser();

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
        error: `This room is not available for the selected dates (${checkIn} to ${checkOut}). It is already booked. Please choose different dates.` 
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
        user_id: user ? user.id : null,
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

export type AvailabilityResult = {
  available: boolean;
  error?: string;
  totalRooms?: number;
  bookedCount?: number;
};

export async function checkRoomAvailabilityAction(
  roomId: string,
  checkIn: string,
  checkOut: string
): Promise<AvailabilityResult> {
  try {
    if (!roomId) {
      return { available: false, error: "Room identifier is required." };
    }
    if (!checkIn || !checkOut) {
      return { available: false, error: "Both check-in and check-out dates are required." };
    }

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
      return { available: false, error: "Please enter valid dates." };
    }

    if (outDate <= inDate) {
      return { available: false, error: "Check-out date must be strictly after the check-in date." };
    }

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, title, total_rooms, quantity, amenities")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      return { available: false, error: "Room not found." };
    }

    const totalAvailable = getRoomTotalCount(room);

    const { data: overlappingBookings, error: overlapError } = await supabase
      .from("bookings")
      .select("id, check_in, check_out")
      .eq("room_id", roomId)
      .neq("status", "cancelled")
      .lt("check_in", checkOut)
      .gt("check_out", checkIn);

    if (overlapError) {
      console.error("Availability query error:", overlapError);
      return { available: false, error: "Could not verify room schedule availability." };
    }

    const bookedCount = overlappingBookings ? overlappingBookings.length : 0;

    if (bookedCount >= totalAvailable) {
      return {
        available: false,
        totalRooms: totalAvailable,
        bookedCount,
        error: `This room is not available for the selected dates (${checkIn} to ${checkOut}). It is already booked. Please choose different dates.`
      };
    }

    return {
      available: true,
      totalRooms: totalAvailable,
      bookedCount
    };
  } catch (err: any) {
    console.error("checkRoomAvailabilityAction error:", err);
    return { available: false, error: "Unable to verify availability." };
  }
}

export async function getRoomBookedDatesAction(roomId: string) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const today = new Date().toISOString().split("T")[0];

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("check_in, check_out")
      .eq("room_id", roomId)
      .neq("status", "cancelled")
      .gte("check_out", today)
      .order("check_in", { ascending: true });

    if (error) {
      console.error("Error fetching booked dates:", error);
      return [];
    }

    return bookings || [];
  } catch (err) {
    console.error("Failed to get booked dates:", err);
    return [];
  }
}


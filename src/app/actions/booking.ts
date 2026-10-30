"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendGuestConfirmation, sendAdminAlert } from "@/lib/email";
import { getRoomTotalCount } from "@/utils/room-inventory";
import { createAdminClient } from "@/utils/supabase/admin";

export type BookingPayload = {
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  notes?: string;
  adults?: number;
  children?: number;
  receiptUrl?: string;
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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const inStart = new Date(checkIn);
    inStart.setHours(0, 0, 0, 0);

    if (inStart < todayStart) {
      return { success: false, error: "Check-in date cannot be in the past. Please choose today or a future date." };
    }

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

    const guestCountText = `${payload.adults || 1} Adult${(payload.adults || 1) > 1 ? "s" : ""}${payload.children ? `, ${payload.children} Child${payload.children > 1 ? "ren" : ""}` : ""}`;
    const formattedNotes = [
      `Party: ${guestCountText}`,
      payload.receiptUrl ? `Payment Receipt: ${payload.receiptUrl}` : null,
      notes?.trim() ? `Special Requests: ${notes.trim()}` : null,
    ].filter(Boolean).join("\n");

    const paymentStatus = payload.receiptUrl ? "receipt_submitted" : "pay_on_arrival";

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
        notes: formattedNotes || null,
        total_amount: totalAmount,
        status: "confirmed",
        payment_status: paymentStatus,
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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const inDateMidnight = new Date(checkIn);
    inDateMidnight.setHours(0, 0, 0, 0);

    if (inDateMidnight < todayStart) {
      return { available: false, error: "Check-in date cannot be in the past." };
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

export async function uploadReceiptAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, error: "Please select a payment receipt file to upload." };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "Receipt file size exceeds the 10MB limit." };
    }

    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      return { success: false, error: "Storage configuration error." };
    }

    // Ensure bucket exists
    const { data: buckets } = await adminSupabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === "booking-receipts")) {
      await adminSupabase.storage.createBucket("booking-receipts", { public: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop() || "jpg";
    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, "");
    const fileName = `receipt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;

    const { error: uploadError } = await adminSupabase.storage
      .from("booking-receipts")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Receipt upload error:", uploadError);
      return { success: false, error: "Failed to upload payment receipt." };
    }

    const { data: publicUrlData } = adminSupabase.storage
      .from("booking-receipts")
      .getPublicUrl(fileName);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error("uploadReceiptAction exception:", err);
    return { success: false, error: err.message || "Failed to upload receipt." };
  }
}


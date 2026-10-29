"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";

// Basic iCal Parser
function parseICalDate(dateStr: string) {
  // Handles: 20241015 or 20241015T120000Z
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}-${month}-${day}`;
}

export async function syncRoomIcalAction(roomId: string, icalUrl: string) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin login required." };
  }

  if (!icalUrl || !icalUrl.startsWith('http')) {
    return { success: false, error: "Invalid iCal URL." };
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  try {
    // 1. Fetch the iCal file
    const response = await fetch(icalUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch iCal feed (Status: ${response.status})`);
    }
    const icalData = await response.text();

    // 2. Parse events
    const lines = icalData.split(/\r?\n/);
    const events: any[] = [];
    let currentEvent: any = null;

    for (const line of lines) {
      if (line.startsWith("BEGIN:VEVENT")) {
        currentEvent = {};
      } else if (line.startsWith("END:VEVENT")) {
        if (currentEvent && currentEvent.start && currentEvent.end) {
          events.push(currentEvent);
        }
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith("DTSTART")) {
          const val = line.split(":")[1];
          if (val) currentEvent.start = parseICalDate(val);
        } else if (line.startsWith("DTEND")) {
          const val = line.split(":")[1];
          if (val) currentEvent.end = parseICalDate(val);
        } else if (line.startsWith("SUMMARY")) {
          const val = line.split(":")[1];
          if (val) currentEvent.summary = val;
        }
      }
    }

    if (events.length === 0) {
      return { success: true, message: "No bookings found in the provided iCal feed." };
    }

    // 3. Clear existing future iCal bookings for this room to avoid duplicates
    const today = new Date().toISOString().split("T")[0];
    const { error: deleteError } = await supabase
      .from("bookings")
      .delete()
      .eq("room_id", roomId)
      .eq("notes", "External Booking (iCal)")
      .gte("check_out", today); // Only delete ones that are current or future

    if (deleteError) {
      throw new Error("Failed to clear previous external bookings: " + deleteError.message);
    }

    // 4. Insert new events
    const insertPayload = events
      .filter(ev => ev.end >= today) // Only import current/future
      .map((ev) => {
        // Calculate nights
        const inDate = new Date(ev.start);
        const outDate = new Date(ev.end);
        const timeDiff = outDate.getTime() - inDate.getTime();
        const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

        return {
          room_id: roomId,
          guest_name: ev.summary ? `External: ${ev.summary}` : "External Booking",
          guest_email: "external@booking.local",
          guest_phone: "0000000000",
          check_in: ev.start,
          check_out: ev.end,
          total_nights: nights,
          total_amount: 0,
          status: "confirmed",
          payment_status: "paid",
          notes: "External Booking (iCal)",
        };
      });

    if (insertPayload.length > 0) {
      const { error: insertError } = await supabase.from("bookings").insert(insertPayload);
      if (insertError) {
        throw new Error("Failed to insert external bookings: " + insertError.message);
      }
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/rooms");
    revalidatePath("/rooms");
    revalidatePath("/");

    return { success: true, message: `Successfully synced ${insertPayload.length} external bookings!` };
  } catch (err: any) {
    console.error("iCal Sync Error:", err);
    return { success: false, error: err.message || "Failed to sync iCal feed." };
  }
}

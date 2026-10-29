"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";

export interface HotelSettings {
  hotelName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
  checkInTime: string;
  checkOutTime: string;
  minStayNights: number;
  maxBookingWindowDays: number;
  taxRatePercent: number;
  cancellationPolicy: string;
  adminAlertEmail: string;
  sendGuestConfirmationEmail: boolean;
  sendAdminAlertEmail: boolean;
  emailFooterText: string;
  maintenanceMode: boolean;
  directBookingDiscountText: string;
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  iban?: string;
  paymentInstructions?: string;
}

const DEFAULT_SETTINGS: HotelSettings = {
  hotelName: "Signature Art Hotel",
  tagline: "Unmatched Luxury & Comfort in Islamabad",
  contactEmail: "reservations@signaturearthotel.com",
  contactPhone: "+92 51 0000000",
  address: "F-8, Islamabad, Pakistan",
  currency: "PKR (₨)",
  timezone: "Asia/Karachi (GMT+5)",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  minStayNights: 1,
  maxBookingWindowDays: 365,
  taxRatePercent: 12,
  cancellationPolicy: "Free cancellation up to 48 hours prior to check-in time.",
  adminAlertEmail: "admin@signaturearthotel.com",
  sendGuestConfirmationEmail: true,
  sendAdminAlertEmail: true,
  emailFooterText: "Thank you for choosing Signature Art Hotel. We look forward to welcoming you.",
  maintenanceMode: false,
  directBookingDiscountText: "Book direct for complimentary welcome beverage & high-speed Wi-Fi.",
  bankName: "Meezan Bank",
  accountTitle: "Signature Art Hotel",
  accountNumber: "01020304050607",
  iban: "PK36MEZN0001020304050607",
  paymentInstructions: "Please transfer the total reservation amount to the bank account above and upload the screenshot of your payment receipt below to confirm your stay.",
};

const SETTINGS_FILE_PATH = path.join(process.cwd(), "src", "data", "hotel-settings.json");

export async function getHotelSettings(): Promise<HotelSettings> {
  try {
    const data = await fs.readFile(SETTINGS_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveHotelSettings(newSettings: Partial<HotelSettings>) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin login required." };
  }

  try {
    const current = await getHotelSettings();
    const updated = { ...current, ...newSettings };

    const dir = path.dirname(SETTINGS_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true, settings: updated };
  } catch (error: any) {
    console.error("Failed to save hotel settings:", error);
    return { success: false, error: error?.message || "Failed to update settings" };
  }
}

"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";
import { createServerClient } from "@supabase/ssr";

export interface PaymentAccount {
  id: string;
  type: "easypaisa" | "jazzcash" | "bank" | "sadapay" | "nayapay" | "custom";
  providerName: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  branchName?: string;
  notes?: string;
  isActive: boolean;
}

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
  paymentAccounts?: PaymentAccount[];
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
  contactPhone: "03331942884",
  address: "Plot # 3 Street 64, F-8/4 F 8/4 F-8, Islamabad, 44220",
  currency: "PKR (₨)",
  timezone: "Asia/Karachi (GMT+5)",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  minStayNights: 1,
  maxBookingWindowDays: 365,
  taxRatePercent: 12,
  cancellationPolicy: "Free cancellation up to 48 hours prior to check-in time.",
  adminAlertEmail: "reception@signaturearthotel.com",
  sendGuestConfirmationEmail: true,
  sendAdminAlertEmail: true,
  emailFooterText: "Thank you for choosing Signature Art Hotel. We look forward to welcoming you.",
  maintenanceMode: false,
  directBookingDiscountText: "Book direct for complimentary welcome beverage & high-speed Wi-Fi.",
  paymentAccounts: [
    {
      id: "acc-easypaisa",
      type: "easypaisa",
      providerName: "EasyPaisa",
      accountTitle: "Signature Art Hotel",
      accountNumber: "03001234567",
      notes: "Send via EasyPaisa app or mobile account",
      isActive: true,
    },
    {
      id: "acc-jazzcash",
      type: "jazzcash",
      providerName: "JazzCash",
      accountTitle: "Signature Art Hotel",
      accountNumber: "03007654321",
      notes: "Send via JazzCash app or mobile account",
      isActive: true,
    },
    {
      id: "acc-meezan",
      type: "bank",
      providerName: "Meezan Bank",
      accountTitle: "Signature Art Hotel",
      accountNumber: "01020304050607",
      iban: "PK36MEZN0001020304050607",
      branchName: "F-8 Markaz Branch, Islamabad",
      notes: "Direct online bank transfer / IBFT / Raast",
      isActive: true,
    },
  ],
  bankName: "Meezan Bank",
  accountTitle: "Signature Art Hotel",
  accountNumber: "01020304050607",
  iban: "PK36MEZN0001020304050607",
  paymentInstructions: "Please transfer the total reservation amount to any of our official accounts above (EasyPaisa, JazzCash, or Bank Account) and upload the payment screenshot below to confirm your stay.",
};

const SETTINGS_FILE_PATH = path.join(process.cwd(), "src", "data", "hotel-settings.json");
const STORAGE_BUCKET = "room-images";
const SETTINGS_STORAGE_PATH = "settings/hotel-settings.json";

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  return createServerClient(supabaseUrl, serviceKey, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
  });
}

export async function getHotelSettings(): Promise<HotelSettings> {
  // 1. Try reading from Supabase Storage (cloud-persistent for Vercel/serverless)
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(SETTINGS_STORAGE_PATH);

    if (data && !error) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // Cloud storage read fallback
  }

  // 2. Fallback to reading bundled/local JSON file
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
    const jsonContent = JSON.stringify(updated, null, 2);

    // 1. Primary: Save to Supabase Storage (bypasses serverless read-only filesystem)
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(SETTINGS_STORAGE_PATH, jsonContent, {
          contentType: "application/json",
          upsert: true,
        });

      if (error) {
        console.warn("Settings storage upload warning:", error.message);
      }
    } catch (storageErr) {
      console.warn("Settings storage exception:", storageErr);
    }

    // 2. Safe local file write for development environment (catches EROFS on Vercel)
    try {
      const dir = path.dirname(SETTINGS_FILE_PATH);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(SETTINGS_FILE_PATH, jsonContent, "utf-8");
    } catch {
      // EROFS on Vercel lambda - safely ignored
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath("/booking");
    revalidatePath("/search");
    revalidatePath("/");

    return { success: true, settings: updated };
  } catch (error: any) {
    console.error("Failed to save hotel settings:", error);
    return { success: false, error: error?.message || "Failed to update settings" };
  }
}

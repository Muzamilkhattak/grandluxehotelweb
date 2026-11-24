"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";
import { createServerClient } from "@supabase/ssr";

export interface HotelAmenity {
  id: string;
  name: string;
  iconUrl: string;
  createdAt: string;
}

const AMENITIES_FILE_PATH = path.join(process.cwd(), "src", "data", "hotel-amenities.json");
const STORAGE_BUCKET = "room-images";
const STORAGE_PATH = "settings/hotel-amenities.json";

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

export async function getHotelAmenities(): Promise<HotelAmenity[]> {
  // 1. Try reading from Supabase Storage (cloud-persistent for Vercel/serverless)
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(STORAGE_PATH);

    if (data && !error) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    // Supabase storage read fallback
  }

  // 2. Fallback to local file if available
  try {
    const localData = await fs.readFile(AMENITIES_FILE_PATH, "utf-8");
    const parsed = JSON.parse(localData);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Local read fallback
  }

  return [];
}

async function saveAmenitiesToStorage(amenities: HotelAmenity[]): Promise<void> {
  const jsonContent = JSON.stringify(amenities, null, 2);

  // 1. Primary: Save to Supabase Storage (bypasses serverless read-only filesystem)
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(STORAGE_PATH, jsonContent, {
        contentType: "application/json",
        upsert: true,
      });

    if (error) {
      console.warn("Storage upload warning:", error.message);
    }
  } catch (storageErr) {
    console.warn("Storage exception:", storageErr);
  }

  // 2. Safe local file write for development environment (catches EROFS on Vercel)
  try {
    const dir = path.dirname(AMENITIES_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(AMENITIES_FILE_PATH, jsonContent, "utf-8");
  } catch {
    // EROFS / read-only filesystem on serverless lambda is completely safe to ignore
  }
}

export async function createHotelAmenityAction(formData: FormData) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin login required." };
  }

  const name = (formData.get("name") as string || "").trim();
  const iconUrl = (formData.get("iconUrl") as string || "").trim();

  if (!name) {
    return { success: false, error: "Amenity name is required." };
  }

  if (!iconUrl) {
    return { success: false, error: "Amenity icon image is required." };
  }

  try {
    const current = await getHotelAmenities();
    
    // Check if duplicate name exists
    const exists = current.some(a => a.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return { success: false, error: "An amenity with this name already exists." };
    }

    const newAmenity: HotelAmenity = {
      id: `amenity-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name,
      iconUrl,
      createdAt: new Date().toISOString(),
    };

    const updated = [newAmenity, ...current];
    await saveAmenitiesToStorage(updated);

    revalidatePath("/admin/amenities");
    revalidatePath("/admin/rooms");
    revalidatePath("/admin/rooms/new");
    revalidatePath("/rooms");

    return { success: true, amenity: newAmenity };
  } catch (error: any) {
    console.error("Failed to create hotel amenity:", error);
    return { success: false, error: error?.message || "Failed to create amenity." };
  }
}

export async function updateHotelAmenityAction(id: string, formData: FormData) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin login required." };
  }

  const name = (formData.get("name") as string || "").trim();
  const iconUrl = (formData.get("iconUrl") as string || "").trim();

  if (!name) {
    return { success: false, error: "Amenity name is required." };
  }

  try {
    const current = await getHotelAmenities();
    const index = current.findIndex(a => a.id === id);
    if (index === -1) {
      return { success: false, error: "Amenity not found." };
    }

    current[index] = {
      ...current[index],
      name,
      ...(iconUrl ? { iconUrl } : {}),
    };

    await saveAmenitiesToStorage(current);

    revalidatePath("/admin/amenities");
    revalidatePath("/admin/rooms");
    revalidatePath("/admin/rooms/new");
    revalidatePath("/rooms");

    return { success: true, amenity: current[index] };
  } catch (error: any) {
    console.error("Failed to update hotel amenity:", error);
    return { success: false, error: error?.message || "Failed to update amenity." };
  }
}

export async function deleteHotelAmenityAction(id: string) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin login required." };
  }

  try {
    const current = await getHotelAmenities();
    const filtered = current.filter(a => a.id !== id);

    await saveAmenitiesToStorage(filtered);

    revalidatePath("/admin/amenities");
    revalidatePath("/admin/rooms");
    revalidatePath("/admin/rooms/new");
    revalidatePath("/rooms");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete hotel amenity:", error);
    return { success: false, error: error?.message || "Failed to delete amenity." };
  }
}

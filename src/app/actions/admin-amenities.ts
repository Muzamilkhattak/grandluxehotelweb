"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export interface HotelAmenity {
  id: string;
  name: string;
  iconUrl: string;
  createdAt: string;
}

const AMENITIES_FILE_PATH = path.join(process.cwd(), "src", "data", "hotel-amenities.json");

export async function getHotelAmenities(): Promise<HotelAmenity[]> {
  try {
    const data = await fs.readFile(AMENITIES_FILE_PATH, "utf-8");
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
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

    const dir = path.dirname(AMENITIES_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(AMENITIES_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8");

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

    const dir = path.dirname(AMENITIES_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(AMENITIES_FILE_PATH, JSON.stringify(current, null, 2), "utf-8");

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

    const dir = path.dirname(AMENITIES_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(AMENITIES_FILE_PATH, JSON.stringify(filtered, null, 2), "utf-8");

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

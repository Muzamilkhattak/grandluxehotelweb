"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";
import { createServerClient } from "@supabase/ssr";

export interface RestaurantSettings {
  tagline: string;
  heading: string;
  subheading: string;
  backgroundImage: string;
  buttonText: string;
}

export type { RestaurantCategory } from "@/data/restaurant-constants";
import type { RestaurantCategory } from "@/data/restaurant-constants";

export interface MenuItemData {
  id: string;
  name: string;
  category: RestaurantCategory;
  price: string;
  description: string;
  image: string;
}

export interface RestaurantData {
  settings: RestaurantSettings;
  items: MenuItemData[];
}

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "restaurant-data.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "restaurant");
const STORAGE_BUCKET = "room-images";
const STORAGE_PATH = "settings/restaurant-data.json";

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

export async function getRestaurantData(): Promise<RestaurantData> {
  // 1. Try reading from Supabase Storage (cloud-persistent for Vercel/serverless)
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(STORAGE_PATH);

    if (data && !error) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object") {
        return {
          settings: parsed.settings || {
            tagline: "Culinary Art & Dining",
            heading: "Signature Art Hotel Restaurant",
            subheading: "Artisanal breakfast spreads, authentic Pakistani Karahi, Continental grills, and handcrafted beverages in Islamabad.",
            backgroundImage: "/images/resturantherobg.webp",
            buttonText: "Explore Full Menu & Book Table",
          },
          items: Array.isArray(parsed.items) && parsed.items.length > 0 ? parsed.items : [],
        };
      }
    }
  } catch (err) {
    // Supabase read fallback
  }

  // 2. Fallback to local file if available
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const parsed = JSON.parse(fileContent);
    return {
      settings: parsed.settings || {
        tagline: "Culinary Art & Dining",
        heading: "Signature Art Hotel Restaurant",
        subheading: "Artisanal breakfast spreads, authentic Pakistani Karahi, Continental grills, and handcrafted beverages in Islamabad.",
        backgroundImage: "/images/resturantherobg.webp",
        buttonText: "Explore Full Menu & Book Table",
      },
      items: Array.isArray(parsed.items) && parsed.items.length > 0 ? parsed.items : [],
    };
  } catch {
    return {
      settings: {
        tagline: "Culinary Art & Dining",
        heading: "Signature Art Hotel Restaurant",
        subheading: "Artisanal breakfast spreads, authentic Pakistani Karahi, Continental grills, and handcrafted beverages in Islamabad.",
        backgroundImage: "/images/resturantherobg.webp",
        buttonText: "Explore Full Menu & Book Table",
      },
      items: [],
    };
  }
}

async function writeRestaurantData(data: RestaurantData) {
  const jsonContent = JSON.stringify(data, null, 2);

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
      console.warn("Storage upload warning (restaurant-data.json):", error.message);
    }
  } catch (storageErr) {
    console.warn("Storage exception (restaurant-data.json):", storageErr);
  }

  // 2. Safe local file write for local development environment (catches EROFS on Vercel)
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, jsonContent, "utf-8");
  } catch {
    // EROFS / read-only filesystem on serverless lambda is completely safe to ignore
  }
}

export async function saveRestaurantSettingsAction(newSettings: RestaurantSettings) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    const current = await getRestaurantData();
    const updated: RestaurantData = {
      ...current,
      settings: {
        ...current.settings,
        ...newSettings,
      },
    };

    await writeRestaurantData(updated);

    revalidatePath("/restaurant");
    revalidatePath("/");
    revalidatePath("/dining");
    revalidatePath("/admin/restaurant");

    return { success: true, settings: updated.settings };
  } catch (err: any) {
    console.error("Failed to save restaurant settings:", err);
    return { success: false, error: err?.message || "Failed to save settings" };
  }
}

export async function saveMenuItemAction(item: MenuItemData) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    const current = await getRestaurantData();
    const items = [...current.items];

    const existingIndex = items.findIndex((i) => i.id === item.id);
    if (existingIndex >= 0) {
      items[existingIndex] = { ...item };
    } else {
      const newItem: MenuItemData = {
        ...item,
        id: item.id || `dish-${Date.now()}`,
      };
      items.push(newItem);
    }

    const updated: RestaurantData = {
      ...current,
      items,
    };

    await writeRestaurantData(updated);

    revalidatePath("/restaurant");
    revalidatePath("/");
    revalidatePath("/dining");
    revalidatePath("/admin/restaurant");

    return { success: true, items: updated.items };
  } catch (err: any) {
    console.error("Failed to save menu item:", err);
    return { success: false, error: err?.message || "Failed to save menu item" };
  }
}

export async function deleteMenuItemAction(id: string) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    const current = await getRestaurantData();
    const targetId = String(id).trim();
    const items = current.items.filter((i) => String(i.id).trim() !== targetId);

    const updated: RestaurantData = {
      ...current,
      items,
    };

    await writeRestaurantData(updated);

    revalidatePath("/restaurant");
    revalidatePath("/");
    revalidatePath("/dining");
    revalidatePath("/admin/restaurant");

    return { success: true, items: updated.items };
  } catch (err: any) {
    console.error("Failed to delete menu item:", err);
    return { success: false, error: err?.message || "Failed to delete menu item" };
  }
}

export async function uploadRestaurantImageAction(formData: FormData) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    const file = formData.get("image") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "No image file provided." };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Uploaded file must be an image." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `restaurant-${Date.now()}-${cleanName}`;

    // 1. Primary: Upload to Supabase Storage
    try {
      const supabase = getSupabaseClient();
      const storagePath = `restaurant/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath);

        if (publicUrlData?.publicUrl) {
          return { success: true, url: publicUrlData.publicUrl };
        }
      }
    } catch (storageErr) {
      console.warn("Storage upload failed, trying local fallback:", storageErr);
    }

    // 2. Local fallback if storage failed and running in local environment
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      const filePath = path.join(UPLOAD_DIR, fileName);
      await fs.writeFile(filePath, buffer);
      return { success: true, url: `/uploads/restaurant/${fileName}` };
    } catch (fsErr: any) {
      return { success: false, error: "Could not save image to cloud storage or local disk." };
    }
  } catch (err: any) {
    console.error("Image upload error:", err);
    return { success: false, error: err?.message || "Failed to upload image." };
  }
}

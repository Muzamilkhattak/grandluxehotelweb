"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";

export async function createRoomAction(formData: FormData) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin login required." };
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price_per_night = parseFloat(formData.get("price_per_night") as string);
  const capacity = parseInt(formData.get("capacity") as string, 10);
  const bed_type = formData.get("bed_type") as string;
  const size_sqft = parseInt(formData.get("size_sqft") as string, 10);
  const total_rooms = parseInt(formData.get("total_rooms") as string, 10) || 1;
  const amenitiesStr = formData.get("amenities") as string;
  
  let amenities = (amenitiesStr || "").split(",").map((a) => a.trim()).filter(Boolean);
  // Prepend total_rooms tag for persistent schema-independent availability tracking
  amenities = [`total_rooms:${total_rooms}`, ...amenities.filter(a => !a.startsWith("total_rooms:"))];

  const imageUrlsStr = formData.get("imageUrls") as string;
  let imageUrls: string[] = [];
  if (imageUrlsStr) {
    try {
      imageUrls = JSON.parse(imageUrlsStr);
    } catch (e) {
      console.error("Failed to parse imageUrls", e);
    }
  }

  // Generate slug
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const payload: any = {
    title,
    slug,
    description,
    price_per_night,
    capacity,
    bed_type,
    size_sqft,
    amenities,
    image_url: imageUrls[0] || null, 
    images: imageUrls,
  };

  const { data: room, error } = await supabase.from('rooms').insert(payload).select().single();

  if (error) {
    console.error("Room creation error", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/rooms");
  revalidatePath("/rooms");
  revalidatePath("/");
  
  return { success: true };
}

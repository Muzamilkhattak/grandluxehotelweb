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
  const bed_type = (formData.get("bed_type") as string) || "Standard Bed";
  const size_sqft = parseInt(formData.get("size_sqft") as string, 10) || 0;
  const total_rooms = parseInt(formData.get("total_rooms") as string, 10) || 1;
  const ical_url = formData.get("ical_url") as string;
  const amenitiesStr = formData.get("amenities") as string;
  
  let amenities = (amenitiesStr || "").split(",").map((a) => a.trim()).filter(Boolean);
  // Prepend total_rooms tag for persistent schema-independent availability tracking
  amenities = [`total_rooms:${total_rooms}`, ...amenities.filter(a => !a.startsWith("total_rooms:") && !a.startsWith("ical_url:"))];
  
  if (ical_url) {
    amenities.push(`ical_url:${ical_url}`);
  }

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

export async function updateRoomAction(id: string, formData: FormData) {
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
  const bed_type = (formData.get("bed_type") as string) || "Standard Bed";
  const size_sqft = parseInt(formData.get("size_sqft") as string, 10) || 0;
  const total_rooms = parseInt(formData.get("total_rooms") as string, 10) || 1;
  const ical_url = formData.get("ical_url") as string;
  const amenitiesStr = formData.get("amenities") as string;
  
  let amenities = (amenitiesStr || "").split(",").map((a) => a.trim()).filter(Boolean);
  // Prepend total_rooms tag for persistent schema-independent availability tracking
  amenities = [`total_rooms:${total_rooms}`, ...amenities.filter(a => !a.startsWith("total_rooms:") && !a.startsWith("ical_url:"))];
  
  if (ical_url) {
    amenities.push(`ical_url:${ical_url}`);
  }

  const imageUrlsStr = formData.get("imageUrls") as string;
  let imageUrls: string[] = [];
  if (imageUrlsStr) {
    try {
      imageUrls = JSON.parse(imageUrlsStr);
    } catch (e) {
      console.error("Failed to parse imageUrls", e);
    }
  }

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

  const { error } = await supabase.from('rooms').update(payload).eq('id', id);

  if (error) {
    console.error("Room update error", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/rooms");
  revalidatePath("/rooms");
  revalidatePath("/");
  
  return { success: true };
}

export async function deleteRoomAction(id: string) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin login required." };
  }

  // Use service role key if available for administrative database access, otherwise fallback to standard client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabase = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  // 1. Fetch room details first for image cleanup
  const { data: room } = await supabase
    .from('rooms')
    .select('id, title, image_url, images')
    .eq('id', id)
    .maybeSingle();

  // 2. Delete all bookings associated with this room to prevent foreign key constraint violations
  const { error: bookingsError } = await supabase
    .from('bookings')
    .delete()
    .eq('room_id', id);

  if (bookingsError) {
    console.error("Error deleting associated bookings", bookingsError);
    return { success: false, error: "Failed to delete associated bookings: " + bookingsError.message };
  }

  // 3. Delete the room itself and select deleted records to verify deletion
  const { data: deletedRows, error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error("Room deletion error", error);
    return { success: false, error: error.message };
  }

  if (!deletedRows || deletedRows.length === 0) {
    return { success: false, error: "Room could not be found or was already deleted." };
  }

  // 4. Clean up any uploaded storage images from room-images bucket (best effort)
  try {
    const allImages = [
      room?.image_url,
      ...(Array.isArray(room?.images) ? room.images : [])
    ].filter(Boolean);

    const storagePaths: string[] = [];
    for (const imgUrl of allImages) {
      if (typeof imgUrl === 'string' && imgUrl.includes('/room-images/')) {
        const parts = imgUrl.split('/room-images/');
        if (parts[1]) {
          storagePaths.push(parts[1].split('?')[0]);
        }
      }
    }

    if (storagePaths.length > 0) {
      await supabase.storage.from('room-images').remove(storagePaths);
    }
  } catch (storageErr) {
    console.warn("Storage image cleanup warning:", storageErr);
  }

  // 5. Invalidate caches for all relevant routes
  revalidatePath("/admin/rooms", "page");
  revalidatePath("/admin/rooms", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/rooms", "page");
  revalidatePath("/rooms/[slug]", "page");
  revalidatePath("/", "page");
  
  return { success: true, message: `Room "${room?.title || 'Accommodation'}" deleted successfully.` };
}

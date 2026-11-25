"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";
import { createSupabaseServerAdmin } from "@/utils/supabase/server";

const BUCKET_NAME = "gallery-images";

/**
 * Ensures the Supabase storage bucket exists and is publicly accessible
 */
async function ensureBucketExists() {
  const supabase = await createSupabaseServerAdmin();
  
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
  
  if (!bucketExists) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
    });
  }
}

export async function uploadGalleryImageAction(formData: FormData) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin login required." };
  }

  try {
    const imageFile = formData.get("image") as File;
    
    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: "Please select an image file to upload" };
    }

    // Validate type
    if (!imageFile.type.startsWith("image/")) {
      return { success: false, error: "Selected file must be an image" };
    }

    // Validate size (10MB max)
    if (imageFile.size > 10485760) {
      return { success: false, error: "Image file size must be less than 10MB" };
    }

    await ensureBucketExists();

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${Date.now()}-${cleanFileName}`;

    const supabase = await createSupabaseServerAdmin();
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return { success: false, error: error.message };
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true, fileName, url: publicUrl };
  } catch (err: any) {
    console.error("Upload error:", err);
    return { success: false, error: err?.message || "Failed to upload image" };
  }
}

export async function deleteGalleryImageAction(fileName: string) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin login required." };
  }

  try {
    const supabase = await createSupabaseServerAdmin();
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error("Supabase delete error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("Delete error:", err);
    return { success: false, error: err?.message || "Failed to delete image" };
  }
}

export async function getGalleryImages() {
  try {
    await ensureBucketExists();
    
    const supabase = await createSupabaseServerAdmin();
    
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error("Supabase list error:", error);
      return [];
    }

    const userImages = files
      .filter((file) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name))
      .map((file) => {
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(file.name);
        
        return {
          id: file.name,
          name: file.name,
          url: publicUrl,
          isUserUploaded: true,
        };
      });

    return userImages;
  } catch (err) {
    console.error("Get gallery images error:", err);
    return [];
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";
import { createSupabaseServerAdmin } from "@/utils/supabase/server";

const BUCKET_NAME = "gallery-images";
const FALLBACK_BUCKET = "room-images";

function getServiceKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Ensures the Supabase storage bucket exists and is publicly accessible
 */
async function ensureBucketExists() {
  const serviceKey = getServiceKey();
  if (!serviceKey) {
    return;
  }

  try {
    const supabase = await createSupabaseServerAdmin();
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
      });
    }
  } catch (err) {
    // Silently continue if bucket creation is restricted or already handled
  }
}

export async function uploadGalleryImageAction(formData: FormData) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin login required." };
  }

  const serviceKey = getServiceKey();
  if (!serviceKey) {
    return {
      success: false,
      error: "Server storage not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your Vercel Environment Variables.",
    };
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

    // 1. Try uploading to primary gallery-images bucket
    let finalUrl = "";
    let finalFileName = fileName;

    const { error: primaryError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: imageFile.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (!primaryError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
      finalUrl = publicUrl;
    } else {
      console.warn(`Upload to ${BUCKET_NAME} failed (${primaryError.message}), trying fallback to ${FALLBACK_BUCKET}...`);

      // 2. Fallback to room-images bucket (under gallery/ folder)
      const fallbackPath = `gallery/${fileName}`;
      const { error: fallbackError } = await supabase.storage
        .from(FALLBACK_BUCKET)
        .upload(fallbackPath, buffer, {
          contentType: imageFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (!fallbackError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from(FALLBACK_BUCKET).getPublicUrl(fallbackPath);
        finalUrl = publicUrl;
        finalFileName = fallbackPath;
      } else {
        console.error("Storage upload error:", primaryError, fallbackError);
        return {
          success: false,
          error:
            primaryError.message ||
            fallbackError.message ||
            "Upload failed. Please ensure SUPABASE_SERVICE_ROLE_KEY is set in Vercel settings.",
        };
      }
    }

    revalidatePath("/admin/gallery");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true, fileName: finalFileName, url: finalUrl };
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

  const serviceKey = getServiceKey();
  if (!serviceKey) {
    return { success: false, error: "Server not configured for deletions. Missing Supabase credentials." };
  }

  try {
    const supabase = await createSupabaseServerAdmin();

    if (fileName.startsWith("gallery/")) {
      await supabase.storage.from(FALLBACK_BUCKET).remove([fileName]);
    } else {
      await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      // Also try fallback bucket path just in case
      await supabase.storage.from(FALLBACK_BUCKET).remove([`gallery/${fileName}`]);
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
    const serviceKey = getServiceKey();
    if (!serviceKey) {
      console.warn("No Supabase key available, returning empty gallery");
      return [];
    }

    await ensureBucketExists();

    const supabase = await createSupabaseServerAdmin();

    let userImages: any[] = [];

    // 1. Fetch from primary gallery-images bucket
    try {
      const { data: files, error } = await supabase.storage.from(BUCKET_NAME).list("", {
        sortBy: { column: "created_at", order: "desc" },
      });

      if (!error && Array.isArray(files)) {
        userImages = files
          .filter((file) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name))
          .map((file) => {
            const {
              data: { publicUrl },
            } = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name);

            return {
              id: file.name,
              name: file.name,
              url: publicUrl,
              isUserUploaded: true,
            };
          });
      }
    } catch {
      // Primary bucket listing fallback
    }

    // 2. Fetch from fallback room-images bucket (gallery/ folder)
    try {
      const { data: fallbackFiles, error: fbError } = await supabase.storage
        .from(FALLBACK_BUCKET)
        .list("gallery", {
          sortBy: { column: "created_at", order: "desc" },
        });

      if (!fbError && Array.isArray(fallbackFiles)) {
        const fallbackImages = fallbackFiles
          .filter((file) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file.name))
          .map((file) => {
            const pathInBucket = `gallery/${file.name}`;
            const {
              data: { publicUrl },
            } = supabase.storage.from(FALLBACK_BUCKET).getPublicUrl(pathInBucket);

            return {
              id: `gallery-${file.name}`,
              name: pathInBucket,
              url: publicUrl,
              isUserUploaded: true,
            };
          });

        userImages = [...userImages, ...fallbackImages];
      }
    } catch {
      // Fallback bucket listing fallback
    }

    return userImages;
  } catch (err) {
    console.error("Get gallery images error:", err);
    return [];
  }
}

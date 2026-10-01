"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");

async function ensureDirectoryExists() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
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

    await ensureDirectoryExists();

    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${Date.now()}-${cleanFileName}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, buffer);

    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: true, fileName };
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
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.unlink(filePath);

    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("Delete error:", err);
    return { success: false, error: err?.message || "Failed to delete image" };
  }
}

export async function getGalleryImages() {
  try {
    await ensureDirectoryExists();
    const files = await fs.readdir(UPLOAD_DIR);

    const userImages = files
      .filter((file) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(file))
      .map((file) => ({
        id: file,
        name: file,
        url: `/uploads/gallery/${file}`,
        isUserUploaded: true,
      }));

    return userImages;
  } catch (err) {
    console.error("Get gallery images error:", err);
    return [];
  }
}

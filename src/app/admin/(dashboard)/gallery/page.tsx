import { getGalleryImages } from "@/app/actions/admin-gallery";
import AdminGalleryClient from "@/components/admin/AdminGalleryClient";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const images = await getGalleryImages();

  return <AdminGalleryClient initialImages={images} />;
}

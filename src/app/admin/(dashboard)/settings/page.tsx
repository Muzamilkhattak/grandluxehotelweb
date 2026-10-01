import { getHotelSettings } from "@/app/actions/admin-settings";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getHotelSettings();

  return <AdminSettingsClient initialSettings={settings} />;
}

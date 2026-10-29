import { getRestaurantData } from "@/app/actions/admin-restaurant";
import RestaurantManager from "@/components/admin/RestaurantManager";

export const metadata = {
  title: "Restaurant & Menu Manager | Oslo Elite Admin",
  description: "Manage restaurant page headings, images, and menu items.",
};

export default async function AdminRestaurantPage() {
  const restaurantData = await getRestaurantData();

  return <RestaurantManager initialData={restaurantData} />;
}

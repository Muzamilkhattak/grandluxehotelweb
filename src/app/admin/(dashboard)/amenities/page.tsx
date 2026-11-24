import { getHotelAmenities } from "@/app/actions/admin-amenities";
import AmenitiesClient from "./AmenitiesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Amenities Management | Signature Art Hotel Admin",
};

export default async function AdminAmenitiesPage() {
  const amenities = await getHotelAmenities();

  return <AmenitiesClient initialAmenities={amenities} />;
}

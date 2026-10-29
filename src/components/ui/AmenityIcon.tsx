import { 
  Wifi, 
  Waves, 
  Sun, 
  GlassWater, 
  Tv, 
  Wind, 
  Dumbbell, 
  Coffee, 
  Car, 
  Check, 
  Bath, 
  Bed, 
  Monitor, 
  Lock, 
  Snowflake,
  Utensils
} from "lucide-react";

export function getAmenityIcon(amenity: string, size = 16) {
  const name = amenity.toLowerCase();

  if (name.includes("wifi") || name.includes("internet")) return <Wifi size={size} />;
  if (name.includes("ocean") || name.includes("sea") || name.includes("pool") || name.includes("swim")) return <Waves size={size} />;
  if (name.includes("balcony") || name.includes("terrace") || name.includes("view") || name.includes("sun")) return <Sun size={size} />;
  if (name.includes("mini bar") || name.includes("minibar") || name.includes("drinks") || name.includes("wine")) return <GlassWater size={size} />;
  if (name.includes("tv") || name.includes("television") || name.includes("screen")) return <Tv size={size} />;
  if (name.includes("air") || name.includes("ac ") || name.includes("conditioning") || name.includes("cooling")) return <Snowflake size={size} />;
  if (name.includes("gym") || name.includes("fitness") || name.includes("workout")) return <Dumbbell size={size} />;
  if (name.includes("coffee") || name.includes("tea") || name.includes("espresso")) return <Coffee size={size} />;
  if (name.includes("park") || name.includes("valet") || name.includes("car")) return <Car size={size} />;
  if (name.includes("bath") || name.includes("jacuzzi") || name.includes("shower") || name.includes("tub") || name.includes("spa")) return <Bath size={size} />;
  if (name.includes("bed") || name.includes("mattress")) return <Bed size={size} />;
  if (name.includes("work") || name.includes("desk") || name.includes("office") || name.includes("computer")) return <Monitor size={size} />;
  if (name.includes("safe") || name.includes("lock") || name.includes("security")) return <Lock size={size} />;
  if (name.includes("dine") || name.includes("food") || name.includes("kitchen") || name.includes("meal")) return <Utensils size={size} />;
  
  // Default checkmark for unknown amenities
  return <Check size={size} />;
}

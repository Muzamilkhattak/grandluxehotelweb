import React from "react";
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
  Utensils,
  Shield,
  Sparkles,
  Shirt,
  Trees,
  Mountain,
  Phone,
  Music,
  LucideIcon
} from "lucide-react";

export interface AmenityItem {
  name: string;
  icon?: string;
  iconUrl?: string;
}

export const ICON_MAP: Record<string, LucideIcon> = {
  wifi: Wifi,
  snowflake: Snowflake,
  bath: Bath,
  bed: Bed,
  tv: Tv,
  coffee: Coffee,
  glasswater: GlassWater,
  utensils: Utensils,
  sun: Sun,
  waves: Waves,
  shield: Shield,
  lock: Lock,
  car: Car,
  dumbbell: Dumbbell,
  monitor: Monitor,
  wind: Wind,
  sparkles: Sparkles,
  shirt: Shirt,
  trees: Trees,
  mountain: Mountain,
  phone: Phone,
  music: Music,
  check: Check,
};

export const AVAILABLE_AMENITY_ICONS: { id: string; label: string }[] = [
  { id: "wifi", label: "High-Speed Wi-Fi" },
  { id: "snowflake", label: "Air Conditioning / Climate" },
  { id: "bath", label: "Marble Bath / Jacuzzi / Shower" },
  { id: "bed", label: "Luxury King / Queen Bed" },
  { id: "tv", label: "Smart 4K TV / Entertainment" },
  { id: "coffee", label: "Espresso / Coffee Maker" },
  { id: "glasswater", label: "Mini Bar / Beverages" },
  { id: "utensils", label: "24/7 Dining / Room Service" },
  { id: "sun", label: "Private Balcony / Terrace View" },
  { id: "waves", label: "Swimming Pool / Spa Access" },
  { id: "shield", label: "Butler / 24/7 Security" },
  { id: "lock", label: "Electronic Laptop Safe" },
  { id: "car", label: "Valet Parking / Chauffeur" },
  { id: "dumbbell", label: "Fitness Center / Gym" },
  { id: "monitor", label: "Workstation / Desk" },
  { id: "wind", label: "Acoustic Privacy / Soundproof" },
  { id: "sparkles", label: "VIP Concierge / Turn-down" },
  { id: "shirt", label: "Laundry / Garment Pressing" },
  { id: "trees", label: "Garden / Nature Setting" },
  { id: "mountain", label: "Mountain / Scenic View" },
  { id: "phone", label: "Direct Dial Concierge" },
  { id: "music", label: "Hi-Fi Sound System" },
  { id: "check", label: "Standard In-Room Feature" },
];

/**
 * Parses raw amenity string or object into a structured AmenityItem.
 */
export function parseAmenity(raw: string | AmenityItem | any): AmenityItem {
  if (!raw) return { name: "" };
  if (typeof raw === "object") {
    return {
      name: raw.name || "",
      icon: raw.icon,
      iconUrl: raw.iconUrl,
    };
  }

  const str = String(raw).trim();
  if (str.startsWith("{") && str.endsWith("}")) {
    try {
      const parsed = JSON.parse(str);
      return {
        name: parsed.name || "",
        icon: parsed.icon,
        iconUrl: parsed.iconUrl,
      };
    } catch {
      // Fallback to plain string if JSON parse fails
    }
  }

  return { name: str };
}

/**
 * Resolves an icon for an amenity based on iconUrl, explicit icon key, or name keyword matching.
 */
export function getAmenityIcon(
  amenity: string | AmenityItem, 
  size = 16, 
  className?: string, 
  strokeWidth = 1.5
): React.ReactNode {
  const item = parseAmenity(amenity);

  // If custom uploaded image/svg URL exists
  if (item.iconUrl) {
    return (
      <img 
        src={item.iconUrl} 
        alt={item.name || "Amenity icon"} 
        style={{ width: size, height: size, maxWidth: "100%", maxHeight: "100%" }}
        className={`object-contain inline-block shrink-0 ${className || ""}`}
      />
    );
  }

  // If explicit icon name matches ICON_MAP
  if (item.icon && ICON_MAP[item.icon.toLowerCase()]) {
    const IconComponent = ICON_MAP[item.icon.toLowerCase()];
    return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
  }

  // Fallback to keyword matching on name
  const name = (item.name || "").toLowerCase();

  if (name.includes("wifi") || name.includes("internet") || name.includes("wireless")) 
    return <Wifi size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("pool") || name.includes("ocean") || name.includes("sea") || name.includes("swim") || name.includes("wellness")) 
    return <Waves size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("balcony") || name.includes("terrace") || name.includes("view") || name.includes("sun") || name.includes("patio")) 
    return <Sun size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("mini bar") || name.includes("minibar") || name.includes("drink") || name.includes("wine") || name.includes("bar")) 
    return <GlassWater size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("tv") || name.includes("television") || name.includes("screen") || name.includes("streaming")) 
    return <Tv size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("air") || name.includes("ac") || name.includes("conditioning") || name.includes("cooling") || name.includes("climate")) 
    return <Snowflake size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("gym") || name.includes("fitness") || name.includes("workout")) 
    return <Dumbbell size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("coffee") || name.includes("tea") || name.includes("espresso") || name.includes("nespresso")) 
    return <Coffee size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("park") || name.includes("valet") || name.includes("car") || name.includes("parking")) 
    return <Car size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("bath") || name.includes("jacuzzi") || name.includes("shower") || name.includes("tub") || name.includes("spa")) 
    return <Bath size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("bed") || name.includes("mattress") || name.includes("linen")) 
    return <Bed size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("work") || name.includes("desk") || name.includes("office") || name.includes("computer")) 
    return <Monitor size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("safe") || name.includes("lock") || name.includes("security")) 
    return <Lock size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("dine") || name.includes("food") || name.includes("kitchen") || name.includes("meal") || name.includes("room service")) 
    return <Utensils size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("butler") || name.includes("guard") || name.includes("shield")) 
    return <Shield size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("sound") || name.includes("acoustic") || name.includes("quiet") || name.includes("privacy")) 
    return <Wind size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("laundry") || name.includes("press") || name.includes("iron")) 
    return <Shirt size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("garden") || name.includes("tree")) 
    return <Trees size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("mountain") || name.includes("hill")) 
    return <Mountain size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("phone") || name.includes("call")) 
    return <Phone size={size} className={className} strokeWidth={strokeWidth} />;
  if (name.includes("music") || name.includes("speaker") || name.includes("audio")) 
    return <Music size={size} className={className} strokeWidth={strokeWidth} />;

  // Default elegant luxury sparkle/check
  return <Sparkles size={size} className={className} strokeWidth={strokeWidth} />;
}

export function AmenityIcon({ 
  amenity, 
  size = 16, 
  className,
  strokeWidth = 1.5
}: { 
  amenity: string | AmenityItem; 
  size?: number; 
  className?: string;
  strokeWidth?: number;
}) {
  return <>{getAmenityIcon(amenity, size, className, strokeWidth)}</>;
}

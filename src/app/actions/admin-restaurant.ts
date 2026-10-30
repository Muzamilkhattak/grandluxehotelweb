"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { verifyAdminSessionServer } from "@/app/actions/admin-auth";

export interface RestaurantSettings {
  tagline: string;
  heading: string;
  subheading: string;
  backgroundImage: string;
  buttonText: string;
}

export interface MenuItemData {
  id: string;
  name: string;
  category: "starters" | "mains" | "desserts" | "drinks";
  price: string;
  description: string;
  image: string;
}

export interface RestaurantData {
  settings: RestaurantSettings;
  items: MenuItemData[];
}

const DEFAULT_RESTAURANT_DATA: RestaurantData = {
  settings: {
    tagline: "Restaurant & Dining",
    heading: "Our Restaurant",
    subheading: "Crafted with fresh seasonal Nordic ingredients and woodfire mastery.",
    backgroundImage: "/images/resturantherobg.webp",
    buttonText: "Explore Full Menu & Book Table",
  },
  items: [
    {
      id: "1",
      name: "Hitra Sea Scallop & Royal Caviar",
      category: "starters",
      price: "NOK 380",
      description: "Pan-seared Arctic scallops, royal caviar, sweet pea reduction & sea water emulsion.",
      image: "/restaurant/starter.jpg",
    },
    {
      id: "2",
      name: "Barents Red King Crab Consommé",
      category: "starters",
      price: "NOK 390",
      description: "Steamed red king crab cluster in clarified golden saffron broth with sea fennel.",
      image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "3",
      name: "Smoked Fjord Trout Tartare",
      category: "starters",
      price: "NOK 290",
      description: "Cold-smoked fjord trout, shallot crisps, mountain horseradish creme & dill oil.",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "4",
      name: "Hardangerfjord Wild King Salmon",
      category: "mains",
      price: "NOK 460",
      description: "Crispy-skin wild salmon, cold-pressed dill oil emulsion, smoked parsnip puree & gold leaf.",
      image: "/restaurant/salmon.jpg",
    },
    {
      id: "5",
      name: "Birch-Charred Wagyu Tenderloin",
      category: "mains",
      price: "NOK 620",
      description: "45-day dry-aged Wagyu tenderloin over birch coals, black winter truffle glaze & king oyster.",
      image: "/restaurant/wagyu.jpg",
    },
    {
      id: "6",
      name: "Pan-Roasted Atlantic Halibut",
      category: "mains",
      price: "NOK 480",
      description: "Lofoten halibut loin basted in noisette butter, golden chanterelles & asparagus spears.",
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "7",
      name: "Alder-Smoked Telemark Venison",
      category: "mains",
      price: "NOK 540",
      description: "Forest venison loin roasted over alder coals, lingonberry reduction & Jerusalem artichoke.",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "8",
      name: "Smoked Valrhona Cloudberry Sphere",
      category: "desserts",
      price: "NOK 240",
      description: "Dark Valrhona chocolate dome, Arctic cloudberry sorbet, warm raspberry coulis & gold.",
      image: "/restaurant/dessert.jpg",
    },
    {
      id: "9",
      name: "Nordic Lingonberry Mille-Feuille",
      category: "desserts",
      price: "NOK 210",
      description: "Caramelized flaky pastry, vanilla bean chantilly, wild mountain lingonberry & cardamom.",
      image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "10",
      name: "Smoked Fjord Old Fashioned",
      category: "drinks",
      price: "NOK 220",
      description: "Sherry-cask Linie Aquavit, single malt, torched rosemary & hand-carved monogram ice.",
      image: "/restaurant/cocktail.jpg",
    },
    {
      id: "11",
      name: "Arctic Cloudberry Botanical Spritz",
      category: "drinks",
      price: "NOK 160",
      description: "Distilled sea buckthorn, lemon thyme, pressed wild cloudberries & elderflower tonic.",
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop",
    },
  ],
};

const DATA_FILE_PATH = path.join(process.cwd(), "src", "data", "restaurant-data.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "restaurant");

async function ensureDir(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function getRestaurantData(): Promise<RestaurantData> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const parsed = JSON.parse(fileContent);
    return {
      settings: { ...DEFAULT_RESTAURANT_DATA.settings, ...(parsed.settings || {}) },
      items: Array.isArray(parsed.items) && parsed.items.length > 0 ? parsed.items : DEFAULT_RESTAURANT_DATA.items,
    };
  } catch {
    return DEFAULT_RESTAURANT_DATA;
  }
}

async function writeRestaurantData(data: RestaurantData) {
  await ensureDir(path.dirname(DATA_FILE_PATH));
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function saveRestaurantSettingsAction(newSettings: RestaurantSettings) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    const current = await getRestaurantData();
    const updated: RestaurantData = {
      ...current,
      settings: {
        ...current.settings,
        ...newSettings,
      },
    };

    await writeRestaurantData(updated);

    revalidatePath("/restaurant");
    revalidatePath("/");
    revalidatePath("/dining");
    revalidatePath("/admin/restaurant");

    return { success: true, settings: updated.settings };
  } catch (err: any) {
    console.error("Failed to save restaurant settings:", err);
    return { success: false, error: err?.message || "Failed to save settings" };
  }
}

export async function saveMenuItemAction(item: MenuItemData) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    const current = await getRestaurantData();
    const items = [...current.items];

    const existingIndex = items.findIndex((i) => i.id === item.id);
    if (existingIndex >= 0) {
      items[existingIndex] = { ...item };
    } else {
      const newItem: MenuItemData = {
        ...item,
        id: item.id || `dish-${Date.now()}`,
      };
      items.push(newItem);
    }

    const updated: RestaurantData = {
      ...current,
      items,
    };

    await writeRestaurantData(updated);

    revalidatePath("/restaurant");
    revalidatePath("/");
    revalidatePath("/dining");
    revalidatePath("/admin/restaurant");

    return { success: true, items: updated.items };
  } catch (err: any) {
    console.error("Failed to save menu item:", err);
    return { success: false, error: err?.message || "Failed to save menu item" };
  }
}

export async function deleteMenuItemAction(id: string) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    const current = await getRestaurantData();
    const targetId = String(id).trim();
    const items = current.items.filter((i) => String(i.id).trim() !== targetId);

    const updated: RestaurantData = {
      ...current,
      items,
    };

    await writeRestaurantData(updated);

    revalidatePath("/restaurant");
    revalidatePath("/");
    revalidatePath("/dining");
    revalidatePath("/admin/restaurant");

    return { success: true, items: updated.items };
  } catch (err: any) {
    console.error("Failed to delete menu item:", err);
    return { success: false, error: err?.message || "Failed to delete menu item" };
  }
}

export async function uploadRestaurantImageAction(formData: FormData) {
  const isAdmin = await verifyAdminSessionServer();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized. Admin session required." };
  }

  try {
    const file = formData.get("image") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "No image file provided." };
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Uploaded file must be an image." };
    }

    await ensureDir(UPLOAD_DIR);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${Date.now()}-${cleanName}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/restaurant/${fileName}`;
    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error("Image upload error:", err);
    return { success: false, error: err?.message || "Failed to upload image." };
  }
}

export type RestaurantCategory =
  | "breakfast"
  | "soups-appetizers"
  | "bbq-grill"
  | "chinese-rice"
  | "continental"
  | "pakistani"
  | "desserts"
  | "beverages"
  | string;

export const RESTAURANT_CATEGORIES = [
  { id: "all", label: "All Offerings" },
  { id: "breakfast", label: "Breakfast Selection" },
  { id: "soups-appetizers", label: "Soups & Appetizers" },
  { id: "bbq-grill", label: "Grilled Specialities" },
  { id: "chinese-rice", label: "Chinese & Noodles" },
  { id: "continental", label: "Continental & Steaks" },
  { id: "pakistani", label: "Pakistani & Karahi" },
  { id: "desserts", label: "Desserts" },
  { id: "beverages", label: "Beverages & Drinks" },
] as const;

export function getCategoryBadgeLabel(cat: string): string {
  switch (cat) {
    case "breakfast":
      return "Breakfast";
    case "soups-appetizers":
      return "Soup & Appetizer";
    case "bbq-grill":
      return "BBQ & Grill";
    case "chinese-rice":
      return "Chinese & Noodles";
    case "continental":
      return "Continental & Steak";
    case "pakistani":
      return "Pakistani Special";
    case "desserts":
      return "Dessert";
    case "beverages":
      return "Beverage";
    case "starters":
      return "Starter";
    case "mains":
      return "Main Course";
    case "drinks":
      return "Drink";
    default:
      return "Signature";
  }
}

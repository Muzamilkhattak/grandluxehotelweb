"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Save,
  X,
  Image as ImageIcon
} from "lucide-react";
import {
  RestaurantData,
  RestaurantSettings,
  MenuItemData,
  saveRestaurantSettingsAction,
  saveMenuItemAction,
  deleteMenuItemAction,
  uploadRestaurantImageAction
} from "@/app/actions/admin-restaurant";

interface Props {
  initialData: RestaurantData;
}

export default function RestaurantManager({ initialData }: Props) {
  const [settings, setSettings] = useState<RestaurantSettings>(initialData.settings);
  const [items, setItems] = useState<MenuItemData[]>(initialData.items);
  
  // Feedback States
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Add / Edit Item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<"starters" | "mains" | "desserts" | "drinks">("mains");
  const [formPrice, setFormPrice] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Handle Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const res = await saveRestaurantSettingsAction(settings);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Restaurant settings saved successfully." });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to update settings." });
      }
    });
  };

  // Open modal to add item
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormCategory("mains");
    setFormPrice("");
    setFormDescription("");
    setFormImage("");
    setIsModalOpen(true);
  };

  // Open modal to edit item
  const handleOpenEdit = (item: MenuItemData) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormDescription(item.description);
    setFormImage(item.image);
    setIsModalOpen(true);
  };

  // Handle File upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);

    const res = await uploadRestaurantImageAction(formData);
    setUploadingImage(false);

    if (res.success && res.url) {
      setFormImage(res.url);
    } else {
      alert(res.error || "Image upload failed.");
    }
  };

  // Handle Save (Add or Update) item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice.trim()) {
      alert("Dish name and price are required.");
      return;
    }

    startTransition(async () => {
      const itemToSave: MenuItemData = {
        id: editingItem ? editingItem.id : `dish-${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        price: formPrice.trim(),
        description: formDescription.trim(),
        image: formImage.trim() || "/restaurant/salmon.jpg",
      };

      const res = await saveMenuItemAction(itemToSave);
      if (res.success && res.items) {
        setItems(res.items);
        setIsModalOpen(false);
        setStatusMessage({ 
          type: "success", 
          text: editingItem ? `Updated "${itemToSave.name}"` : `Added "${itemToSave.name}"` 
        });
      } else {
        alert(res.error || "Failed to save dish.");
      }
    });
  };

  // Trigger Delete confirmation modal
  const handleDeleteItem = (id: string, name: string) => {
    setItemToDelete({ id, name });
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const { id, name } = itemToDelete;

    startTransition(async () => {
      const res = await deleteMenuItemAction(id);
      if (res.success && res.items) {
        setItems(res.items);
        setItemToDelete(null);
        setIsModalOpen(false);
        setStatusMessage({ type: "success", text: `Deleted "${name}" from menu.` });
      } else {
        alert(res.error || "Failed to delete dish.");
      }
    });
  };

  // Filtered dishes
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== "all" && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.price.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">
            Restaurant & dining
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Dining settings, background artwork, and culinary menu items.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/restaurant"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 text-xs font-medium rounded-lg transition-colors"
          >
            <span>Live menu</span>
            <ExternalLink size={13} className="text-zinc-400" />
          </Link>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} className="text-[#d7b56d]" />
            <span>Add dish</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-lg flex items-center justify-between text-xs border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={15} className="text-emerald-600" />
            ) : (
              <AlertCircle size={15} className="text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-zinc-500 hover:text-zinc-800 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: Page Headings & Banner Settings */}
      <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-zinc-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Restaurant display settings
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Applies to the /restaurant page and homepage dining showcase.</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Top tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="Restaurant & Dining"
                className="w-full h-9 px-3 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Main heading
              </label>
              <input
                type="text"
                value={settings.heading}
                onChange={(e) => setSettings({ ...settings, heading: e.target.value })}
                placeholder="Our Restaurant Menu"
                className="w-full h-9 px-3 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">
              Subheading / description
            </label>
            <textarea
              rows={2}
              value={settings.subheading}
              onChange={(e) => setSettings({ ...settings, subheading: e.target.value })}
              placeholder="Crafted with fresh seasonal ingredients and woodfire mastery."
              className="w-full p-3 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Background image path
              </label>
              <input
                type="text"
                value={settings.backgroundImage}
                onChange={(e) => setSettings({ ...settings, backgroundImage: e.target.value })}
                placeholder="/restaurant/interior.jpg"
                className="w-full h-9 px-3 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">
                Call to action label
              </label>
              <input
                type="text"
                value={settings.buttonText}
                onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                placeholder="Explore Full Menu"
                className="w-full h-9 px-3 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Save size={13} />
              <span>{isPending ? "Saving..." : "Save settings"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Menu Items List & Management */}
      <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-xs">
        
        {/* Header & Filter Bar */}
        <div className="p-4 border-b border-zinc-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Menu dishes ({items.length})
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Individual offerings categorized by starters, mains, desserts, and beverages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes..."
                className="h-9 pl-9 pr-3 border border-zinc-200 text-xs rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 border border-zinc-200 text-xs rounded-lg bg-white text-zinc-700 focus:outline-none focus:border-zinc-400 cursor-pointer"
            >
              <option value="all">All categories</option>
              <option value="starters">Starters</option>
              <option value="mains">Mains</option>
              <option value="desserts">Desserts</option>
              <option value="drinks">Drinks & cocktails</option>
            </select>
          </div>
        </div>

        {/* Table of Menu Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 border-b border-zinc-200/80 text-zinc-500 font-medium">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Photo</th>
                <th className="py-3 px-4">Dish name</th>
                <th className="py-3 px-4 w-28">Category</th>
                <th className="py-3 px-4 w-28">Price</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/80 bg-white">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    No menu items found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                    {/* Circular Image */}
                    <td className="py-3 px-4 text-center">
                      <div className="relative w-10 h-10 mx-auto rounded-full overflow-hidden border border-zinc-200 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 font-medium text-zinc-900">
                      {item.name}
                    </td>

                    {/* Category Badge */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[11px] capitalize font-medium rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-medium text-zinc-900 tabular-nums">
                      {item.price}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 text-zinc-500 max-w-xs truncate">
                      {item.description}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Dish"
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          title="Delete Dish"
                          className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: ADD / EDIT MENU ITEM */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white border border-zinc-200 shadow-2xl max-w-lg w-full overflow-hidden rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-200/80 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <UtensilsCrossed size={16} className="text-[#d7b56d]" />
                <span>{editingItem ? "Edit menu dish" : "Add menu dish"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="p-5 space-y-4 text-xs">
              
              {/* Dish Name */}
              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Dish name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Hardangerfjord Wild King Salmon"
                  className="w-full h-9 px-3 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full h-9 px-3 border border-zinc-200 rounded-lg text-xs bg-white text-zinc-700 focus:outline-none focus:border-zinc-400 cursor-pointer"
                  >
                    <option value="starters">Starters</option>
                    <option value="mains">Mains</option>
                    <option value="desserts">Desserts</option>
                    <option value="drinks">Drinks & cocktails</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. PKR 3,800"
                    className="w-full h-9 px-3 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Crispy-skin wild salmon, dill oil emulsion, smoked parsnip puree."
                  className="w-full p-3 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {/* Image Preview & Upload */}
              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Dish circular photo *
                </label>
                
                <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-200 shrink-0 bg-zinc-100">
                    {formImage ? (
                      <Image
                        src={formImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="/restaurant/salmon.jpg or image URL"
                      className="w-full h-8 px-2.5 border border-zinc-200 rounded-md text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                    />

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium rounded-md transition-colors">
                        <Upload size={12} />
                        <span>{uploadingImage ? "Uploading..." : "Upload photo"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-zinc-400">
                        PNG, JPG, WEBP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
                {editingItem ? (
                  <button
                    type="button"
                    onClick={() => setItemToDelete({ id: editingItem.id, name: editingItem.name })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? "Saving..." : editingItem ? "Update dish" : "Add dish"}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DELETION */}
      {itemToDelete && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setItemToDelete(null)}
        >
          <div 
            className="bg-white border border-zinc-200 shadow-xl max-w-sm w-full p-5 rounded-xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-rose-600">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Delete menu item</h3>
                <p className="text-xs text-zinc-500">Permanent removal</p>
              </div>
            </div>
            
            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-zinc-900 font-semibold">&quot;{itemToDelete.name}&quot;</strong>? It will be removed immediately from public listings.
            </p>

            <div className="pt-2 border-t border-zinc-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 rounded-lg font-medium text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer inline-flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>{isPending ? "Deleting..." : "Delete dish"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

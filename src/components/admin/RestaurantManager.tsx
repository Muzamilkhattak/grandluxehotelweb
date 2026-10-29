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
  Sparkles,
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
      if (res.success && res.settings) {
        setSettings(res.settings);
        setStatusMessage({ type: "success", text: "Restaurant settings saved successfully!" });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to save settings." });
      }
    });
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName("");
    setFormCategory("mains");
    setFormPrice("NOK ");
    setFormDescription("");
    setFormImage("/restaurant/salmon.jpg");
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item: MenuItemData) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormDescription(item.description);
    setFormImage(item.image);
    setIsModalOpen(true);
  };

  // Image Upload handler
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
      alert(res.error || "Image upload failed");
    }
  };

  // Handle Item Save (Add or Update)
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice.trim()) {
      alert("Please provide dish name and price.");
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
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#c3c4c7]">
        <div>
          <h1 className="text-2xl font-semibold text-[#1d2327] flex items-center gap-2">
            <UtensilsCrossed className="text-[#2271b1]" size={24} />
            Restaurant & Menu Management
          </h1>
          <p className="text-[13px] text-[#646970] mt-1">
            Edit restaurant page headings, background images, and manage menu items with prices, descriptions, and circular photos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/restaurant"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f0f6fc] text-[13px] font-medium rounded-sm transition-colors"
          >
            <span>View Public Menu</span>
            <ExternalLink size={14} />
          </Link>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-[13px] font-semibold rounded-sm shadow-sm transition-colors"
          >
            <Plus size={15} />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-sm flex items-center justify-between text-[13.5px] border ${
            statusMessage.type === "success"
              ? "bg-[#ecf7ed] border-[#46b450] text-[#1e4620]"
              : "bg-[#fcf0f1] border-[#dc3232] text-[#801313]"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={16} className="text-[#46b450]" />
            ) : (
              <AlertCircle size={16} className="text-[#dc3232]" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-gray-500 hover:text-black text-[12px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: Page Headings & Banner Settings */}
      <div className="bg-white border border-[#c3c4c7] shadow-sm">
        <div className="px-5 py-4 border-b border-[#f0f0f1] bg-[#f6f7f7] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#1d2327] flex items-center gap-2">
            <Sparkles size={16} className="text-[#d7b56d]" />
            Restaurant Page Headings & Display Settings
          </h2>
          <span className="text-[12px] text-[#646970]">Applies to both /restaurant page and Home Menu section</span>
        </div>

        <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-semibold text-[#1d2327] mb-1">
                Top Tagline / Kicker
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                placeholder="Restaurant & Dining"
                className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm text-[13.5px] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1d2327] mb-1">
                Main Heading
              </label>
              <input
                type="text"
                value={settings.heading}
                onChange={(e) => setSettings({ ...settings, heading: e.target.value })}
                placeholder="Our Restaurant Menu"
                className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm text-[13.5px] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[#1d2327] mb-1">
              Subheading / Description
            </label>
            <textarea
              rows={2}
              value={settings.subheading}
              onChange={(e) => setSettings({ ...settings, subheading: e.target.value })}
              placeholder="Crafted with fresh seasonal Nordic ingredients and woodfire mastery."
              className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm text-[13.5px] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-semibold text-[#1d2327] mb-1">
                Background Image URL (Home Section)
              </label>
              <input
                type="text"
                value={settings.backgroundImage}
                onChange={(e) => setSettings({ ...settings, backgroundImage: e.target.value })}
                placeholder="/restaurant/interior.jpg"
                className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm text-[13.5px] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1d2327] mb-1">
                Home CTA Button Text
              </label>
              <input
                type="text"
                value={settings.buttonText}
                onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                placeholder="Explore Full Menu & Book Table"
                className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm text-[13.5px] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] disabled:opacity-50 text-white text-[13px] font-semibold rounded-sm shadow-sm transition-colors"
            >
              <Save size={15} />
              <span>{isPending ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Menu Items List & Management */}
      <div className="bg-white border border-[#c3c4c7] shadow-sm">
        
        {/* Header & Filter Bar */}
        <div className="px-5 py-4 border-b border-[#f0f0f1] bg-[#f6f7f7] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d2327]">
              Menu Items ({items.length})
            </h2>
            <p className="text-[12px] text-[#646970]">
              Dishes displayed on the restaurant page and home menu with prices and circular photos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes..."
                className="pl-8 pr-3 py-1.5 border border-[#8c8f94] text-[13px] rounded-sm focus:outline-none focus:border-[#2271b1]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 border border-[#8c8f94] text-[13px] rounded-sm bg-white focus:outline-none focus:border-[#2271b1]"
            >
              <option value="all">All Categories</option>
              <option value="starters">Starters</option>
              <option value="mains">Mains</option>
              <option value="desserts">Desserts</option>
              <option value="drinks">Drinks & Cocktails</option>
            </select>
          </div>
        </div>

        {/* Table of Menu Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13.5px]">
            <thead>
              <tr className="bg-[#f0f0f1] text-[#2c3338] font-semibold border-b border-[#c3c4c7]">
                <th className="py-2.5 px-4 w-16 text-center">Image</th>
                <th className="py-2.5 px-4">Dish Name</th>
                <th className="py-2.5 px-4 w-28">Category</th>
                <th className="py-2.5 px-4 w-28">Price</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f1]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No menu items found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f9f9f9] transition-colors">
                    {/* Circular Image */}
                    <td className="py-3 px-4 text-center">
                      <div className="relative w-12 h-12 mx-auto rounded-full overflow-hidden border-2 border-[#d7b56d] shadow-sm">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4 font-semibold text-[#1d2327]">
                      {item.name}
                    </td>

                    {/* Category Badge */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[11.5px] uppercase tracking-wider font-semibold rounded-sm bg-gray-100 text-gray-700 border border-gray-200">
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-semibold text-[#d7b56d]">
                      {item.price}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 text-[#50575e] text-[13px] max-w-xs truncate">
                      {item.description}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Dish"
                          className="p-1.5 text-[#2271b1] hover:bg-[#f0f6fc] rounded-sm transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          title="Delete Dish"
                          className="p-1.5 text-[#b32d2e] hover:bg-[#fcf0f1] rounded-sm transition-colors"
                        >
                          <Trash2 size={15} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#c3c4c7] shadow-2xl max-w-lg w-full overflow-hidden rounded-sm animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-[#1d2327] text-white flex items-center justify-between">
              <h3 className="text-[15px] font-semibold flex items-center gap-2">
                <UtensilsCrossed size={16} className="text-[#d7b56d]" />
                {editingItem ? "Edit Menu Dish" : "Add New Menu Dish"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-[13.5px]">
              
              {/* Dish Name */}
              <div>
                <label className="block font-semibold text-[#1d2327] mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Hardangerfjord Wild King Salmon"
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm focus:outline-none focus:border-[#2271b1]"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#1d2327] mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm bg-white focus:outline-none focus:border-[#2271b1]"
                  >
                    <option value="starters">Starters</option>
                    <option value="mains">Mains</option>
                    <option value="desserts">Desserts</option>
                    <option value="drinks">Drinks & Cocktails</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1d2327] mb-1">
                    Price (with currency) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. NOK 460"
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm focus:outline-none focus:border-[#2271b1]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-[#1d2327] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Crispy-skin wild salmon, dill oil emulsion, smoked parsnip puree & gold leaf."
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm focus:outline-none focus:border-[#2271b1]"
                />
              </div>

              {/* Image with Circular Preview */}
              <div>
                <label className="block font-semibold text-[#1d2327] mb-1">
                  Dish Circular Photo *
                </label>
                
                <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-sm">
                  {/* Circular preview */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#d7b56d] shrink-0 bg-gray-200 shadow-sm">
                    {formImage ? (
                      <Image
                        src={formImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="/restaurant/salmon.jpg or image URL"
                      className="w-full px-2.5 py-1.5 border border-[#8c8f94] rounded-sm text-[12.5px] focus:outline-none focus:border-[#2271b1]"
                    />

                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f0f6fc] text-[12px] font-medium rounded-sm transition-colors">
                        <Upload size={13} />
                        <span>{uploadingImage ? "Uploading..." : "Upload New File"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11.5px] text-gray-500">
                        PNG, JPG, WEBP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-3">
                {editingItem ? (
                  <button
                    type="button"
                    onClick={() => setItemToDelete({ id: editingItem.id, name: editingItem.name })}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-[#b32d2e] border border-red-200 rounded-sm font-semibold text-[13px] transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Delete Dish</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white rounded-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isPending ? "Saving..." : editingItem ? "Update Dish" : "Add Dish to Menu"}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* DEDICATED IN-APP CONFIRMATION MODAL FOR DELETION */}
      {itemToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#c3c4c7] shadow-2xl max-w-md w-full p-6 rounded-sm space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-[#b32d2e]">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#1d2327]">Delete Menu Item</h3>
                <p className="text-[12px] text-gray-500">Permanent removal</p>
              </div>
            </div>
            
            <p className="text-[13.5px] text-[#2c3338] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#1d2327]">"{itemToDelete.name}"</strong>? It will be removed immediately from both the restaurant page and the homepage menu section.
            </p>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-sm font-medium text-[13px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-[#b32d2e] hover:bg-[#8f2424] text-white rounded-sm font-semibold text-[13px] shadow-sm transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>{isPending ? "Deleting..." : "Yes, Delete Dish"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

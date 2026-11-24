"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Check, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { AmenityItem } from "@/components/ui/AmenityIcon";
import { HotelAmenity, getHotelAmenities } from "@/app/actions/admin-amenities";

interface RoomAmenitiesManagerProps {
  initialAmenities?: AmenityItem[];
  onChange?: (amenities: AmenityItem[]) => void;
}

export default function RoomAmenitiesManager({
  initialAmenities = [],
  onChange,
}: RoomAmenitiesManagerProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityItem[]>(initialAmenities);
  const [availableAmenities, setAvailableAmenities] = useState<HotelAmenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadMasterAmenities() {
      try {
        const list = await getHotelAmenities();
        setAvailableAmenities(list || []);
      } catch (err) {
        console.error("Failed to load master amenities:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMasterAmenities();
  }, []);

  const updateSelected = (newList: AmenityItem[]) => {
    setSelectedAmenities(newList);
    if (onChange) onChange(newList);
  };

  const handleToggleAmenity = (amenity: HotelAmenity) => {
    const isSelected = selectedAmenities.some(
      (a) => a.name.toLowerCase() === amenity.name.toLowerCase()
    );

    if (isSelected) {
      // Remove
      const filtered = selectedAmenities.filter(
        (a) => a.name.toLowerCase() !== amenity.name.toLowerCase()
      );
      updateSelected(filtered);
    } else {
      // Add
      const updated = [
        ...selectedAmenities,
        {
          name: amenity.name,
          iconUrl: amenity.iconUrl,
        },
      ];
      updateSelected(updated);
    }
  };

  const handleSelectAll = () => {
    const allItems: AmenityItem[] = availableAmenities.map((a) => ({
      name: a.name,
      iconUrl: a.iconUrl,
    }));
    updateSelected(allItems);
  };

  const handleDeselectAll = () => {
    updateSelected([]);
  };

  const filtered = availableAmenities.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Hidden input to pass selected amenities with room form */}
      <input
        type="hidden"
        name="amenitiesData"
        value={JSON.stringify(selectedAmenities)}
      />
      <input
        type="hidden"
        name="amenities"
        value={selectedAmenities.map((a) => a.name).join(", ")}
      />

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-semibold text-zinc-900">
              Pick Amenities for this Suite
            </span>
            <span className="bg-zinc-900 text-[#d7b56d] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              {selectedAmenities.length} selected
            </span>
          </div>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            Click on any uploaded amenity to assign or remove it from this accommodation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/amenities"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-[12px] text-[#000000] hover:text-[#d7b56d] font-medium transition-colors bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg"
          >
            <Sparkles size={13} className="text-[#d7b56d]" />
            <span>Manage / Upload Amenities</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-zinc-500 text-sm">
          <Loader2 size={16} className="animate-spin text-[#d7b56d]" />
          <span>Loading uploaded hotel amenities...</span>
        </div>
      ) : availableAmenities.length === 0 ? (
        <div className="text-center py-10 px-4 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
          <AlertCircle size={28} className="text-[#d7b56d] mx-auto mb-2" />
          <h4 className="text-[14px] font-semibold text-zinc-800 mb-1">
            No amenities uploaded yet in the Amenities Catalog
          </h4>
          <p className="text-[12px] text-zinc-500 max-w-md mx-auto mb-4">
            Upload your hotel's master amenities and custom icons first from the Amenities tab. Once uploaded, they will appear here to pick.
          </p>
          <Link
            href="/admin/amenities"
            className="inline-flex items-center gap-2 bg-[#000000] hover:bg-zinc-800 text-white text-[12.5px] px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Sparkles size={14} className="text-[#d7b56d]" />
            <span>Open Amenities Tab to Upload</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Controls: Search & Select All */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search amenities..."
                className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-[12.5px] text-zinc-900 focus:outline-none focus:border-[#d7b56d]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-[12px]">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-zinc-600 hover:text-black font-medium hover:underline cursor-pointer"
              >
                Select All
              </button>
              <span className="text-zinc-300">|</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-zinc-600 hover:text-black font-medium hover:underline cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Amenities Grid to Pick */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto p-1 border border-zinc-200/80 rounded-lg bg-zinc-50/40">
            {filtered.map((amenity) => {
              const isSelected = selectedAmenities.some(
                (a) => a.name.toLowerCase() === amenity.name.toLowerCase()
              );

              return (
                <div
                  key={amenity.id}
                  onClick={() => handleToggleAmenity(amenity)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-white border-[#d7b56d] shadow-sm ring-1 ring-[#d7b56d]"
                      : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 p-1.5 transition-colors ${
                        isSelected
                          ? "bg-[#d7b56d]/15 border border-[#d7b56d]/50"
                          : "bg-zinc-100 border border-zinc-200"
                      }`}
                    >
                      <img
                        src={amenity.iconUrl}
                        alt={amenity.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span
                      className={`text-[13px] truncate ${
                        isSelected ? "font-semibold text-zinc-900" : "font-medium text-zinc-700"
                      }`}
                      title={amenity.name}
                    >
                      {amenity.name}
                    </span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ml-2 ${
                      isSelected
                        ? "bg-[#d7b56d] text-black"
                        : "border border-zinc-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

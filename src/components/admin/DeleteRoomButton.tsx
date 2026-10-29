"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteRoomAction } from "@/app/actions/admin-rooms";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteRoomButtonProps {
  roomId: string;
  roomTitle?: string;
  onDeleted?: (roomId: string) => void;
}

export default function DeleteRoomButton({ roomId, roomTitle, onDeleted }: DeleteRoomButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const titleText = roomTitle ? `"${roomTitle}"` : "this room";
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${titleText}? All associated bookings and photos will also be deleted. This action cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await deleteRoomAction(roomId);
      if (res.success) {
        if (onDeleted) {
          onDeleted(roomId);
        }
        router.refresh();
      } else {
        alert(res.error || "Failed to delete room. Please try again.");
      }
    } catch (err: any) {
      console.error("Delete room error:", err);
      alert(err.message || "An unexpected error occurred while deleting the room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-[12px] text-red-600 border-b border-red-600 hover:text-red-700 hover:border-red-700 transition-colors font-medium flex items-center gap-1 disabled:opacity-50 cursor-pointer"
      title={roomTitle ? `Delete ${roomTitle}` : "Delete room"}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      <span>{loading ? "Deleting..." : "Delete"}</span>
    </button>
  );
}

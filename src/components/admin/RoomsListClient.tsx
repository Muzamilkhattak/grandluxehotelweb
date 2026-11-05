"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRoomTotalCount } from "@/utils/room-inventory";
import { deleteRoomAction } from "@/app/actions/admin-rooms";
import { 
  CheckCircle2, 
  BedDouble, 
  Plus, 
  Trash2, 
  Pencil,
  AlertTriangle, 
  Loader2, 
  X,
  AlertCircle 
} from "lucide-react";

interface RoomItem {
  id: string;
  title: string;
  price_per_night: number;
  capacity?: number;
  capacity_guests?: number;
  bed_type?: string;
  image_url?: string;
  amenities?: string[];
  [key: string]: any;
}

export default function RoomsListClient({ initialRooms }: { initialRooms: RoomItem[] }) {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomItem[]>(initialRooms || []);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Custom Confirmation Modal State
  const [roomToDelete, setRoomToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setRooms(initialRooms || []);
  }, [initialRooms]);

  const openDeleteModal = (room: { id: string; title: string }) => {
    setRoomToDelete(room);
    setDeleteError(null);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setRoomToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteRoomAction(roomToDelete.id);
      if (res.success) {
        const deletedTitle = roomToDelete.title;
        setRooms((prev) => prev.filter((r) => r.id !== roomToDelete.id));
        setRoomToDelete(null);
        setNotification(`Room "${deletedTitle}" was deleted successfully.`);
        router.refresh();

        setTimeout(() => {
          setNotification(null);
        }, 4000);
      } else {
        setDeleteError(res.error || "Failed to delete room. Please try again.");
      }
    } catch (err: any) {
      console.error("Delete room error:", err);
      setDeleteError(err.message || "An unexpected error occurred while deleting the room.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-medium">{notification}</span>
          </div>
          <button 
            type="button"
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid of Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => {
          const totalQty = getRoomTotalCount(room);

          return (
            <div 
              key={room.id} 
              className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-xs hover:border-zinc-300 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Photo with Inventory Pill */}
                <div className="relative aspect-[16/10] w-full bg-zinc-100 overflow-hidden">
                  <Image 
                    src={room.image_url || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop"} 
                    alt={room.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-0.5 rounded-md shadow-xs">
                    Inventory: {totalQty} {totalQty === 1 ? 'room' : 'rooms'}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-zinc-900 truncate">{room.title}</h3>
                  <div className="mt-1 text-xs text-zinc-500">
                    Up to {room.capacity || room.capacity_guests || 2} guests • {room.bed_type || "King bed"}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-zinc-900 tabular-nums">
                    PKR {Number(room.price_per_night || 0).toLocaleString()} 
                    <span className="text-xs text-zinc-500 font-normal ml-1">/ night</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 bg-zinc-50/60 border-t border-zinc-200/80 flex justify-between items-center text-xs">
                <span className="inline-flex items-center gap-1.5 text-zinc-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/admin/rooms/${room.id}`} 
                    className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 px-2.5 py-1 rounded-md transition-colors font-medium"
                  >
                    <Pencil size={12} />
                    <span>Edit</span>
                  </Link>
                  <button 
                    type="button"
                    onClick={() => openDeleteModal({ id: room.id, title: room.title })}
                    className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {rooms.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-zinc-200/80 rounded-xl p-8">
            <BedDouble size={40} className="mx-auto text-zinc-300 mb-3" />
            <h3 className="text-base font-semibold text-zinc-900 mb-1">No rooms in inventory</h3>
            <p className="text-xs text-zinc-500 mb-4 max-w-sm mx-auto">
              All suites have been removed or none have been created yet.
            </p>
            <Link 
              href="/admin/rooms/new" 
              className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <Plus size={14} className="text-[#d7b56d]" />
              <span>Add room</span>
            </Link>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {roomToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={closeDeleteModal}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-zinc-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              type="button"
              disabled={isDeleting}
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            {/* Warning Icon & Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-rose-600 w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Delete accommodation</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Permanent removal from database
                </p>
              </div>
            </div>

            {/* Body */}
            <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
              Are you sure you want to delete <strong className="text-zinc-900 font-semibold">&quot;{roomToDelete.title}&quot;</strong>?
              All associated bookings, schedule records, and uploaded media will be removed.
            </p>

            {deleteError && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={closeDeleteModal}
                className="px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Delete room</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

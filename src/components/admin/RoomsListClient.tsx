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
        // Instantly remove room from local state
        setRooms((prev) => prev.filter((r) => r.id !== roomToDelete.id));
        setRoomToDelete(null);
        setNotification(`Room "${deletedTitle}" was deleted successfully.`);

        // Sync server cache
        router.refresh();

        // Auto-dismiss notification after 4s
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
    <div>
      {/* Toast Notification */}
      {notification && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-md flex items-center justify-between shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-medium font-jost">{notification}</span>
          </div>
          <button 
            type="button"
            onClick={() => setNotification(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs uppercase font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid of rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
        {rooms.map((room) => {
          const totalQty = getRoomTotalCount(room);

          return (
            <div 
              key={room.id} 
              className="flex flex-col bg-white border border-[#EAEAEA] rounded-none overflow-hidden shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative h-[200px] w-full bg-[#f6f7f7]">
                <Image 
                  src={room.image_url || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop"} 
                  alt={room.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute top-3 right-3 bg-[#000000] text-white text-[12px] font-jost px-3 py-1 font-medium shadow-md">
                  Inventory: {totalQty} {totalQty === 1 ? 'Room' : 'Rooms'}
                </div>
              </div>

              <div className="p-[24px] flex flex-col flex-1">
                <h3 className="font-marcellus text-[24px] text-[#000000] mb-2 leading-snug">{room.title}</h3>
                <div className="font-jost text-[14px] text-[#555E63] mb-4 space-y-1">
                  <div className="font-semibold text-[#000000]">${room.price_per_night} / night</div>
                  <div>Up to {room.capacity || room.capacity_guests || 2} Guests • {room.bed_type || "King Bed"}</div>
                </div>

                <div className="mt-auto pt-4 border-t border-[#EAEAEA] flex justify-between items-center">
                  <span className="text-[12px] uppercase text-[#d7b56d] tracking-widest font-semibold">Active</span>
                  <div className="flex items-center gap-4">
                    <Link 
                      href={`/admin/rooms/${room.id}`} 
                      className="text-[12px] text-[#000000] border-b border-[#000000] hover:text-[#d7b56d] hover:border-[#d7b56d] transition-colors font-medium"
                    >
                      Edit
                    </Link>
                    <button 
                      type="button"
                      onClick={() => openDeleteModal({ id: room.id, title: room.title })}
                      className="text-[12px] text-red-600 border-b border-red-600 hover:text-red-700 hover:border-red-700 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {rooms.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-[#EAEAEA] p-8">
            <BedDouble size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-marcellus text-2xl text-[#000000] mb-1">No Rooms in Inventory</h3>
            <p className="font-jost text-sm text-[#555E63] mb-6 max-w-md mx-auto">
              All suites have been removed or none have been created yet. Click below to add a new luxury suite.
            </p>
            <Link 
              href="/admin/rooms/new" 
              className="inline-flex items-center gap-2 bg-[#000000] text-white font-jost font-medium text-[15px] px-6 py-3 rounded-full hover:bg-[#d7b56d] transition-colors shadow-sm"
            >
              <Plus size={16} /> Add New Room
            </Link>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {roomToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeDeleteModal}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              type="button"
              disabled={isDeleting}
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            {/* Warning Icon & Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-jost">Delete Accommodation</h3>
                <p className="text-sm text-gray-500 font-jost mt-0.5">
                  Permanent removal from database
                </p>
              </div>
            </div>

            {/* Body */}
            <p className="text-sm text-gray-600 font-jost mb-4 leading-relaxed">
              Are you sure you want to completely delete{" "}
              <strong className="text-gray-900 font-semibold font-marcellus text-[15px]">
                &quot;{roomToDelete.title}&quot;
              </strong>?
              All associated bookings, calendar schedules, and uploaded media will be permanently removed.
            </p>

            {/* Error Message in Modal */}
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer disabled:opacity-50 font-jost"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm font-jost"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Room</span>
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

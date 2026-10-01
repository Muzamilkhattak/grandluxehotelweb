import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { getRoomTotalCount } from "@/utils/room-inventory";

export default async function RoomsAdminPage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="text-red-500 font-jost">Failed to load rooms: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-marcellus text-[44px] text-[#362618]">Accommodations & Rooms</h1>
          <p className="font-jost text-sm text-[#555E63]">Manage physical room inventory and suite pricing.</p>
        </div>
        <Link href="/admin/rooms/new" className="bg-[#362618] text-white font-jost font-medium text-[16px] px-[30px] py-[15px] rounded-full hover:bg-[#323232] transition-colors shadow-sm">
          Add New Room
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
        {rooms?.map((room) => {
          const totalQty = getRoomTotalCount(room);

          return (
            <div key={room.id} className="flex flex-col bg-white border border-[#EAEAEA] rounded-none overflow-hidden shadow-sm">
              <div className="relative h-[200px] w-full">
                <Image 
                  src={room.image_url || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop"} 
                  alt={room.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 right-3 bg-[#362618] text-white text-[12px] font-jost px-3 py-1 font-medium shadow-md">
                  Inventory: {totalQty} {totalQty === 1 ? 'Room' : 'Rooms'}
                </div>
              </div>
              <div className="p-[24px] flex flex-col flex-1">
                <h3 className="font-marcellus text-[24px] text-[#362618] mb-2">{room.title}</h3>
                <div className="font-jost text-[14px] text-[#555E63] mb-4 space-y-1">
                  <div>${room.price_per_night} / night</div>
                  <div>Up to {room.capacity} Guests • {room.bed_type} Bed</div>
                </div>
                <div className="mt-auto pt-4 border-t border-[#EAEAEA] flex justify-between items-center">
                  <span className="text-[12px] uppercase text-[#C97A4F] tracking-widest font-semibold">Active</span>
                  <button className="text-[12px] text-[#362618] border-b border-[#362618] hover:text-[#C97A4F] hover:border-[#C97A4F] transition-colors font-medium">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {(!rooms || rooms.length === 0) && (
          <div className="col-span-full py-12 text-center text-[#555E63] font-jost">
            No rooms found. Click "Add New Room" to create one.
          </div>
        )}
      </div>
    </div>
  );
}

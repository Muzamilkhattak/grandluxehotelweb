import Link from "next/link";
import { Plus } from "lucide-react";
import RoomsListClient from "@/components/admin/RoomsListClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RoomsAdminPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabase = createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 text-red-700 font-jost rounded-md">
        Failed to load rooms: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-marcellus text-[36px] sm:text-[44px] text-[#000000] leading-tight">
            Accommodations & Rooms
          </h1>
          <p className="font-jost text-sm text-[#555E63]">
            Manage physical room inventory, suite amenities, and nightly pricing.
          </p>
        </div>
        <Link 
          href="/admin/rooms/new" 
          className="inline-flex items-center gap-2 bg-[#000000] text-white font-jost font-medium text-[15px] sm:text-[16px] px-6 sm:px-[30px] py-3 sm:py-[15px] rounded-full hover:bg-[#d7b56d] transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} /> Add New Room
        </Link>
      </div>

      <RoomsListClient initialRooms={rooms || []} />
    </div>
  );
}

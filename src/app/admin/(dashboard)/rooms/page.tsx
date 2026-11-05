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
      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
        Failed to load rooms: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">Accommodations</h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Physical room inventory, suite amenities, and nightly pricing.
          </p>
        </div>
        <Link 
          href="/admin/rooms/new" 
          className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors shadow-xs"
        >
          <Plus size={14} className="text-[#d7b56d]" />
          <span>Add room</span>
        </Link>
      </div>

      <RoomsListClient initialRooms={rooms || []} />
    </div>
  );
}

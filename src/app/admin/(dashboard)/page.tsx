import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { DollarSign, Percent, CalendarCheck, Clock } from "lucide-react";
import RecentBookingsTable from "@/components/admin/RecentBookingsTable";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Fetch all bookings for the table and KPI calculation
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      rooms ( title, image_url )
    `)
    .order("created_at", { ascending: false });

  // Calculate simple mock KPIs based on real data
  const totalRevenue = bookings?.filter(b => b.status === 'confirmed').reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;
  const activeReservations = bookings?.filter(b => b.status === 'confirmed').length || 0;
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Dashboard</h1>
      </div>

      {/* KPI Analytics Grid - WP Style Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <WPWidgetCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          trend="+14% vs last month" 
          icon={<DollarSign size={20} className="text-[#2271b1]" />} 
          positive 
        />
        <WPWidgetCard 
          title="Live Occupancy Rate" 
          value="84%" 
          trend="Optimal capacity" 
          icon={<Percent size={20} className="text-[#2271b1]" />} 
          positive={false} 
        />
        <WPWidgetCard 
          title="Active Reservations" 
          value={activeReservations.toString()} 
          trend="Next 7 days" 
          icon={<CalendarCheck size={20} className="text-[#2271b1]" />} 
          positive={false} 
        />
        <WPWidgetCard 
          title="Pending Check-ins" 
          value="3" 
          trend="Requires attention" 
          icon={<Clock size={20} className="text-[#d63638]" />} 
          positive={false}
          alert
        />
      </div>

      <div className="pt-2">
        <div className="bg-white border border-[#c3c4c7] shadow-sm">
          <div className="px-4 py-3 border-b border-[#c3c4c7]">
            <h2 className="text-[14px] font-semibold text-[#1d2327]">Recent Reservations</h2>
          </div>
          <div className="p-4">
            <RecentBookingsTable initialBookings={bookings || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

function WPWidgetCard({ title, value, trend, icon, positive, alert }: any) {
  return (
    <div className="bg-white border border-[#c3c4c7] shadow-sm">
      <div className="px-4 py-3 border-b border-[#c3c4c7] flex justify-between items-center bg-[#f6f7f7]">
        <h3 className="text-[14px] font-semibold text-[#1d2327]">{title}</h3>
        <div>{icon}</div>
      </div>
      <div className="p-4">
        <div className="text-[28px] font-normal text-[#1d2327] mb-2 leading-none">{value}</div>
        <div className={`text-[13px] ${alert ? 'text-[#d63638]' : positive ? 'text-[#00a32a]' : 'text-[#50575e]'}`}>
          {trend}
        </div>
      </div>
    </div>
  );
}

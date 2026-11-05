import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Percent, CalendarCheck, Clock, TrendingUp } from "lucide-react";
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Title Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">Overview</h1>
        <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
          Real-time operations, occupancy tracking, and recent guest reservations.
        </p>
      </div>

      {/* KPI Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Total revenue" 
          value={`PKR ${totalRevenue.toLocaleString()}`} 
          comparison="+14% vs last month"
          icon={<TrendingUp size={16} className="text-emerald-600" />}
          positive
        />
        <MetricCard 
          label="Live occupancy" 
          value="84%" 
          comparison="Target 80% achieved"
          icon={<Percent size={16} className="text-zinc-500" />}
        />
        <MetricCard 
          label="Active reservations" 
          value={activeReservations.toString()} 
          comparison="Upcoming 7 days"
          icon={<CalendarCheck size={16} className="text-zinc-500" />}
        />
        <MetricCard 
          label="Pending check-ins" 
          value="3" 
          comparison="Requires front-desk confirmation"
          icon={<Clock size={16} className="text-amber-600" />}
          alert
        />
      </div>

      {/* Recent Reservations Table Container */}
      <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-zinc-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Recent reservations</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Live booking transactions and guest arrival status.</p>
          </div>
        </div>
        <div className="p-5">
          <RecentBookingsTable initialBookings={bookings || []} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  label, 
  value, 
  comparison, 
  icon, 
  positive, 
  alert 
}: { 
  label: string; 
  value: string; 
  comparison: string; 
  icon: React.ReactNode; 
  positive?: boolean; 
  alert?: boolean; 
}) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        <div className="w-7 h-7 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-semibold text-zinc-900 tracking-tight tabular-nums">{value}</div>
        <div className={`text-xs mt-1 font-medium ${
          alert ? 'text-amber-600' : positive ? 'text-emerald-600' : 'text-zinc-500'
        }`}>
          {comparison}
        </div>
      </div>
    </div>
  );
}

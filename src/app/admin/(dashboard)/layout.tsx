import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { Montserrat } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-auth";
import { logoutAdminAction } from "@/app/actions/admin-auth";
import { LogOut, ExternalLink, Plus } from "lucide-react";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check (Defense in depth)
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const session = await verifyAdminToken(token);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className={`flex h-screen bg-[#f0f0f1] ${montserrat.className} text-[#3c434a] overflow-hidden`}>
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* WP-style slim Topbar */}
        <header className="h-[36px] bg-[#1d2327] border-b border-[#2c3338] flex items-center justify-between px-4 z-10 sticky top-0 shrink-0 select-none">
          <div className="flex items-center gap-4 text-[13px] text-white/80">
            <Link 
              href="/" 
              target="_blank"
              className="hover:text-white hover:bg-[#2c3338] px-2.5 py-1 -ml-2 rounded-sm transition-colors flex items-center gap-1.5 font-medium"
            >
              <span>View Site</span>
              <ExternalLink size={12} className="opacity-70" />
            </Link>
          </div>

          <div className="flex items-center gap-2 h-full">
            <Link 
              href="/admin/rooms/new" 
              className="text-white/80 hover:text-white hover:bg-[#2c3338] px-3 h-full flex items-center text-[13px] transition-colors"
            >
              <Plus size={14} className="mr-1 text-[#72aee6]" /> New Room
            </Link>
            
            <div className="text-white/90 px-3 h-full flex items-center text-[13px] font-medium border-l border-[#2c3338]/60">
              <span className="text-white/50 mr-1.5">Logged in as:</span>
              <span className="text-[#c5a880] font-semibold">{session.u}</span>
            </div>

            <form action={logoutAdminAction} className="h-full flex items-center">
              <button 
                type="submit"
                className="text-red-400 hover:text-white hover:bg-red-900/40 px-2.5 h-[28px] my-auto rounded-sm flex items-center gap-1.5 text-[12px] font-medium transition-colors"
                title="Log out of admin panel"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

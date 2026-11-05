import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-auth";
import { logoutAdminAction } from "@/app/actions/admin-auth";
import { LogOut, ExternalLink, Plus } from "lucide-react";

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
    <div className="flex h-screen bg-[#f8f9fa] text-zinc-800 antialiased overflow-hidden font-jost">
      {/* Sleek Admin Navigation Sidebar */}
      <AdminSidebar />
      
      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        {/* Modern Quiet Topbar (56px) */}
        <header className="h-14 bg-white border-b border-zinc-200/80 flex items-center justify-between px-6 z-10 sticky top-0 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              target="_blank"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 px-3 py-1.5 rounded-lg transition-colors border border-zinc-200/60"
            >
              <span>View live site</span>
              <ExternalLink size={13} className="text-zinc-400" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/admin/rooms/new" 
              className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Plus size={14} className="text-[#d7b56d]" />
              <span>Add room</span>
            </Link>
            
            <div className="hidden sm:flex items-center text-xs font-medium text-zinc-500 pl-3 border-l border-zinc-200">
              <span className="text-zinc-400 mr-1.5">User:</span>
              <span className="text-zinc-900 font-semibold">{session.u}</span>
            </div>

            <form action={logoutAdminAction}>
              <button 
                type="submit"
                className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                title="Log out of admin panel"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Scrollable Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

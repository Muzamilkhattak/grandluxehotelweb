"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, KeySquare, PlusCircle, Users, Settings, LogOut, UserCircle, ImageIcon } from "lucide-react";

import { logoutAdminAction } from "@/app/actions/admin-auth";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", icon: <LayoutDashboard size={18} />, label: "Dashboard", exact: true },
    { href: "/admin/bookings", icon: <CalendarDays size={18} />, label: "Reservations" },
    { href: "/admin/rooms", icon: <KeySquare size={18} />, label: "Accommodations", exact: true },
    { href: "/admin/rooms/new", icon: <PlusCircle size={18} />, label: "Add New Room" },
    { href: "/admin/gallery", icon: <ImageIcon size={18} />, label: "Gallery" },
    { href: "/admin/guests", icon: <Users size={18} />, label: "Guests" },
    { href: "/admin/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <aside className="w-[200px] md:w-[240px] bg-[#1d2327] text-[#f0f0f1] flex flex-col z-20 shrink-0 select-none">
      <div className="p-4 flex items-center gap-3 bg-[#1d2327] border-b border-[#2c3338]/40">
        <div className="w-8 h-8 bg-gradient-to-br from-[#c5a880] to-[#997a4d] rounded flex items-center justify-center text-[#111] font-bold text-base shadow-sm">
          Ø
        </div>
        <div>
          <h2 className="font-semibold text-[14px] tracking-wide text-white leading-tight">Oslo Elite</h2>
          <span className="text-[11px] text-[#c5a880] font-medium">Hotel Management</span>
        </div>
      </div>
      
      <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item, idx) => {
          const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          
          return (
            <div key={item.href}>
              {idx === 6 && <div className="my-2 border-t border-[#2c3338]/60" />}
              <Link 
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-2.5 text-[14px] transition-colors relative ${isActive ? 'bg-[#2271b1] text-white font-semibold' : 'text-[#a7aaad] hover:text-[#72aee6] hover:bg-[#2c3338] font-medium'}`}
              >
                <div className={`${isActive ? 'text-white' : 'text-[#a7aaad] group-hover:text-[#72aee6]'}`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="p-3.5 bg-[#171c1f] border-t border-[#2c3338] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#2c3338] flex items-center justify-center text-[#c5a880] border border-[#c5a880]/30 shrink-0">
            <UserCircle size={18} strokeWidth={1.8} />
          </div>
          <div className="flex flex-col min-w-0 truncate">
            <span className="text-[13px] font-semibold text-white leading-tight truncate">Administrator</span>
            <span className="text-[10px] text-emerald-400 font-medium">Active Session</span>
          </div>
        </div>
        <form action={logoutAdminAction}>
          <button 
            type="submit"
            title="Log Out" 
            className="text-[#a7aaad] hover:text-red-400 hover:bg-[#2c3338] transition-colors p-1.5 rounded"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}


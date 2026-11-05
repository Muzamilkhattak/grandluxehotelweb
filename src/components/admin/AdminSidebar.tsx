"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  KeySquare, 
  PlusCircle, 
  Users, 
  Settings, 
  LogOut, 
  UserCircle, 
  ImageIcon, 
  UtensilsCrossed 
} from "lucide-react";
import { logoutAdminAction } from "@/app/actions/admin-auth";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", icon: <LayoutDashboard size={16} strokeWidth={1.75} />, label: "Dashboard", exact: true },
    { href: "/admin/bookings", icon: <CalendarDays size={16} strokeWidth={1.75} />, label: "Reservations" },
    { href: "/admin/rooms", icon: <KeySquare size={16} strokeWidth={1.75} />, label: "Accommodations", exact: true },
    { href: "/admin/rooms/new", icon: <PlusCircle size={16} strokeWidth={1.75} />, label: "Add room" },
    { href: "/admin/restaurant", icon: <UtensilsCrossed size={16} strokeWidth={1.75} />, label: "Restaurant & menu" },
    { href: "/admin/gallery", icon: <ImageIcon size={16} strokeWidth={1.75} />, label: "Media gallery" },
    { href: "/admin/guests", icon: <Users size={16} strokeWidth={1.75} />, label: "Guest directory" },
    { href: "/admin/settings", icon: <Settings size={16} strokeWidth={1.75} />, label: "Hotel settings" },
  ];

  return (
    <aside className="w-[230px] md:w-[245px] bg-[#0c0d0e] text-zinc-300 flex flex-col z-20 shrink-0 select-none border-r border-zinc-800/80">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-zinc-800/80 flex flex-col items-center text-center">
        <Link href="/admin" className="flex flex-col items-center gap-1 group py-0.5" aria-label="Signature Art Hotel Admin">
          <Image
            src="/images/logo/signaturearthotellogo.webp"
            alt="Signature Art Hotel"
            width={180}
            height={90}
            priority
            className="h-16 w-auto object-contain transition-opacity group-hover:opacity-90"
          />
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#d7b56d]/90 mt-1">
            Executive Portal
          </span>
        </Link>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-500">
          Management
        </div>
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          
          return (
            <div key={item.href}>
              {item.href === "/admin/gallery" && (
                <div className="my-2 border-t border-zinc-800/80" />
              )}
              <Link 
                href={item.href} 
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors relative ${
                  isActive 
                    ? 'bg-zinc-800 text-white font-medium' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                }`}
              >
                <div className={`${isActive ? 'text-[#d7b56d]' : 'text-zinc-400'}`}>
                  {item.icon}
                </div>
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d7b56d] shrink-0" />
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-3 bg-[#0a0a0b] border-t border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-[#d7b56d] border border-zinc-700 shrink-0">
            <UserCircle size={17} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col min-w-0 truncate">
            <span className="text-xs font-medium text-zinc-200 leading-tight truncate">Administrator</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-zinc-400">Authenticated</span>
            </div>
          </div>
        </div>
        <form action={logoutAdminAction}>
          <button 
            type="submit"
            title="Log out" 
            className="text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 p-1.5 rounded-md transition-colors"
          >
            <LogOut size={14} />
          </button>
        </form>
      </div>
    </aside>
  );
}

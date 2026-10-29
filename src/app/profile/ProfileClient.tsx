"use client";

import { useState } from "react";
import { User, LogOut, Edit2, Check, X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { logoutAction, deleteAccountAction } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfileClient({ initialUser }: { initialUser: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(initialUser.user_metadata?.full_name || "");
  const [phone, setPhone] = useState(initialUser.user_metadata?.phone || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const router = useRouter();

  const handleUpdate = async () => {
    setLoading(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        phone: phone
      }
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      router.refresh();
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    const res = await deleteAccountAction();
    if (res.success) {
      router.push("/login");
      router.refresh();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to delete account" });
      setShowDeleteConfirm(false);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#d7b56d] p-6 shadow-sm rounded-sm sticky top-[140px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-marcellus text-lg text-[#000000]">Personal Details</h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-[#d7b56d] hover:text-[#000000] transition-colors p-1"
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {message && (
        <div className={`p-3 mb-4 text-[13px] font-jost border ${
          message.type === 'success' ? 'bg-[#F0FDF4] text-[#166534] border-[#22C55E]' : 'bg-[#FEF2F2] text-[#991B1B] border-[#EF4444]'
        }`}>
          {message.text}
        </div>
      )}

      {!isEditing ? (
        <>
          <div className="mb-6">
            <p className="text-[11px] font-jost uppercase tracking-widest text-[#000000] mb-1">Full Name</p>
            <p className="font-marcellus text-xl text-[#000000]">{initialUser.user_metadata?.full_name || "Guest"}</p>
          </div>
          <div className="mb-6">
            <p className="text-[11px] font-jost uppercase tracking-widest text-[#000000] mb-1">Email Address</p>
            <p className="font-jost text-[15px] text-[#000000]">{initialUser.email}</p>
          </div>
          <div className="mb-8">
            <p className="text-[11px] font-jost uppercase tracking-widest text-[#000000] mb-1">Phone Number</p>
            <p className="font-jost text-[15px] text-[#000000]">{initialUser.user_metadata?.phone || "Not provided"}</p>
          </div>
        </>
      ) : (
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-[11px] font-jost uppercase tracking-widest text-[#000000] mb-1 block">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#d7b56d] focus:border-[#d7b56d] px-3 py-2 text-[14px] font-jost text-[#000000] outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-jost uppercase tracking-widest text-[#000000] mb-1 block">Email (Cannot be changed)</label>
            <input 
              type="text" 
              value={initialUser.email}
              readOnly
              className="w-full bg-[#FFFFFF] border border-[#d7b56d] px-3 py-2 text-[14px] font-jost text-[#000000] outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-[11px] font-jost uppercase tracking-widest text-[#000000] mb-1 block">Phone Number</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#d7b56d] focus:border-[#d7b56d] px-3 py-2 text-[14px] font-jost text-[#000000] outline-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button 
              onClick={handleUpdate}
              disabled={loading}
              className="flex-1 bg-[#d7b56d] hover:bg-[#000000] text-[#000000] hover:text-white py-2 font-jost text-[12px] uppercase tracking-wider font-semibold transition-all duration-300 flex items-center justify-center gap-1 disabled:opacity-70"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Save</>}
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="flex-1 bg-[#FFFFFF] hover:bg-[#FFFFFF] border border-[#d7b56d] text-[#000000] py-2 font-jost text-[12px] uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 pt-6 border-t border-[#d7b56d]">
        <form action={async () => { 
          await logoutAction(); 
          router.push("/");
          router.refresh();
        }}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#000000] text-[#000000] hover:bg-[#000000] hover:text-white transition-colors font-jost uppercase tracking-wider text-[12px] font-semibold cursor-pointer">
            <LogOut size={14} />
            Sign Out
          </button>
        </form>
        
        {!showDeleteConfirm ? (
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#FEF2F2] transition-colors font-jost uppercase tracking-wider text-[12px] font-semibold"
          >
            <Trash2 size={14} />
            Delete Account
          </button>
        ) : (
          <div className="bg-[#FEF2F2] border border-[#EF4444] p-3 text-center">
            <AlertTriangle size={24} className="mx-auto text-[#EF4444] mb-2" />
            <p className="text-[12px] font-jost text-[#991B1B] mb-3">Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="flex gap-2">
              <button 
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 bg-[#EF4444] text-white py-1.5 font-jost text-[11px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1 disabled:opacity-70"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : "Yes, Delete"}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 bg-white border border-[#d7b56d] text-[#000000] py-1.5 font-jost text-[11px] uppercase tracking-wider font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

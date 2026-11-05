"use client";

import { useState, useTransition } from "react";
import { 
  Building2, 
  Clock, 
  Bell, 
  Receipt, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ShieldAlert, 
  Info,
  Sparkles,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Smartphone,
  Landmark,
  X,
  Check
} from "lucide-react";
import { HotelSettings, PaymentAccount, saveHotelSettings } from "@/app/actions/admin-settings";

export default function AdminSettingsClient({ initialSettings }: { initialSettings: HotelSettings }) {
  const [settings, setSettings] = useState<HotelSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<"general" | "policies" | "payments" | "notifications" | "financials">("general");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Multi-Payment Accounts State
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountForm, setAccountForm] = useState<Omit<PaymentAccount, "id">>({
    type: "easypaisa",
    providerName: "EasyPaisa",
    accountTitle: "",
    accountNumber: "",
    iban: "",
    branchName: "",
    notes: "",
    isActive: true,
  });

  const openAddAccountModal = () => {
    setEditingAccount(null);
    setAccountForm({
      type: "easypaisa",
      providerName: "EasyPaisa",
      accountTitle: settings.hotelName || "Signature Art Hotel",
      accountNumber: "",
      iban: "",
      branchName: "",
      notes: "Instant mobile transfer",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditAccountModal = (acc: PaymentAccount) => {
    setEditingAccount(acc);
    setAccountForm({
      type: acc.type,
      providerName: acc.providerName,
      accountTitle: acc.accountTitle,
      accountNumber: acc.accountNumber,
      iban: acc.iban || "",
      branchName: acc.branchName || "",
      notes: acc.notes || "",
      isActive: acc.isActive,
    });
    setIsModalOpen(true);
  };

  const handleAccountTypeChange = (type: PaymentAccount["type"]) => {
    let defaultProvider = accountForm.providerName;
    let defaultNotes = accountForm.notes;
    if (type === "easypaisa") {
      defaultProvider = "EasyPaisa";
      defaultNotes = "Send via EasyPaisa mobile app or account";
    } else if (type === "jazzcash") {
      defaultProvider = "JazzCash";
      defaultNotes = "Send via JazzCash mobile app or account";
    } else if (type === "bank") {
      defaultProvider = "Meezan Bank";
      defaultNotes = "Direct online bank transfer / IBFT / Raast";
    } else if (type === "sadapay") {
      defaultProvider = "SadaPay";
      defaultNotes = "Send via SadaPay wallet";
    } else if (type === "nayapay") {
      defaultProvider = "NayaPay";
      defaultNotes = "Send via NayaPay wallet";
    }
    setAccountForm((prev) => ({
      ...prev,
      type,
      providerName: defaultProvider,
      notes: defaultNotes,
    }));
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.accountTitle.trim() || !accountForm.accountNumber.trim()) {
      return;
    }

    let updatedAccounts: PaymentAccount[] = [...(settings.paymentAccounts || [])];

    if (editingAccount) {
      updatedAccounts = updatedAccounts.map((a) =>
        a.id === editingAccount.id ? { ...accountForm, id: editingAccount.id } : a
      );
    } else {
      const newAcc: PaymentAccount = {
        ...accountForm,
        id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      };
      updatedAccounts.push(newAcc);
    }

    handleChange("paymentAccounts", updatedAccounts);
    setIsModalOpen(false);
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm("Are you sure you want to delete this payment account?")) {
      const updatedAccounts = (settings.paymentAccounts || []).filter((a) => a.id !== id);
      handleChange("paymentAccounts", updatedAccounts);
    }
  };

  const handleToggleAccountActive = (id: string) => {
    const updatedAccounts = (settings.paymentAccounts || []).map((a) =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    handleChange("paymentAccounts", updatedAccounts);
  };

  const handleChange = (field: keyof HotelSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setStatusMsg(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    startTransition(async () => {
      const res = await saveHotelSettings(settings);
      if (res.success) {
        setStatusMsg({ type: "success", text: "Settings saved successfully." });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ type: "error", text: res.error || "Failed to update settings" });
      }
    });
  };

  const tabs = [
    { id: "general", label: "General Information", icon: <Building2 size={16} /> },
    { id: "policies", label: "Check-in & Policies", icon: <Clock size={16} /> },
    { id: "payments", label: "Bank & Payments", icon: <CreditCard size={16} /> },
    { id: "notifications", label: "Email & Alerts", icon: <Bell size={16} /> },
    { id: "financials", label: "Rates & Direct Perks", icon: <Receipt size={16} /> },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-zinc-900 tracking-tight">Hotel settings</h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Hotel profile, policies, bank payment accounts, and email notifications.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === "success" ? (
              <CheckCircle size={15} className="text-emerald-600" />
            ) : (
              <AlertCircle size={15} className="text-rose-600" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        </div>
      )}

      {/* Settings Form Container */}
      <form onSubmit={handleSave} className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-xs">
        {/* Horizontal Navigation Tabs */}
        <div className="flex border-b border-zinc-200/80 bg-zinc-50/70 overflow-x-auto p-1.5 gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <span className={isActive ? "text-[#d7b56d]" : "text-zinc-400"}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-6">
          {/* TAB 1: General Info */}
          {activeTab === "general" && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div>
                <h2 className="text-[15px] font-semibold text-zinc-900">Property Identity & Contact</h2>
                <p className="text-[12.5px] text-zinc-500">This information appears on public booking vouchers and guest communications.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Hotel Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.hotelName}
                    onChange={(e) => handleChange("hotelName", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => handleChange("tagline", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Reservations Contact Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={settings.contactEmail}
                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Contact Phone Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.contactPhone}
                    onChange={(e) => handleChange("contactPhone", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Physical Address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Operating Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  >
                    <option value="PKR (₨)">PKR (₨)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="NOK (kr)">NOK (kr)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Hotel Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  >
                    <option value="Europe/Oslo (GMT+1)">Europe/Oslo (GMT+1)</option>
                    <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                    <option value="America/New_York (EST)">America/New_York (EST)</option>
                    <option value="Europe/London (GMT+0)">Europe/London (GMT+0)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Check-in & Policies */}
          {activeTab === "policies" && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div>
                <h2 className="text-[15px] font-semibold text-zinc-900">Stay Restrictions & Times</h2>
                <p className="text-[12.5px] text-zinc-500">Control check-in/out scheduling and reservation limits.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Standard Check-in Time
                  </label>
                  <input
                    type="time"
                    value={settings.checkInTime}
                    onChange={(e) => handleChange("checkInTime", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                  <span className="text-[11.5px] text-zinc-500 mt-1 block">Earliest time guests may enter room.</span>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Standard Check-out Time
                  </label>
                  <input
                    type="time"
                    value={settings.checkOutTime}
                    onChange={(e) => handleChange("checkOutTime", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                  <span className="text-[11.5px] text-zinc-500 mt-1 block">Latest departure time before housekeeping.</span>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Minimum Stay (Nights)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.minStayNights}
                    onChange={(e) => handleChange("minStayNights", parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Max Advance Booking Window (Days)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={730}
                    value={settings.maxBookingWindowDays}
                    onChange={(e) => handleChange("maxBookingWindowDays", parseInt(e.target.value) || 365)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Cancellation Policy Notice
                  </label>
                  <textarea
                    rows={3}
                    value={settings.cancellationPolicy}
                    onChange={(e) => handleChange("cancellationPolicy", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                  <span className="text-[11.5px] text-zinc-500 mt-1 block">Displayed on guest confirmation and room booking screens.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Multi-Provider Bank & Payment Accounts */}
          {activeTab === "payments" && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80">
                <div>
                  <h2 className="text-[16px] font-semibold text-zinc-900">
                    Payment Accounts (EasyPaisa, JazzCash, Bank Accounts)
                  </h2>
                  <p className="text-[12.5px] text-zinc-500">
                    Add and manage the accounts displayed on the guest checkout page. Guests will see these details to transfer booking funds and submit their screenshot.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddAccountModal}
                  className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-medium px-4 py-2 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer self-start sm:self-center"
                >
                  <Plus size={15} />
                  Add Payment Method
                </button>
              </div>

              {/* Accounts List */}
              <div className="space-y-3.5">
                {(settings.paymentAccounts && settings.paymentAccounts.length > 0) ? (
                  settings.paymentAccounts.map((account) => {
                    const isEasyPaisa = account.type === "easypaisa";
                    const isJazzCash = account.type === "jazzcash";
                    const isBank = account.type === "bank";

                    return (
                      <div
                        key={account.id}
                        className={`p-4 border rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          account.isActive
                            ? "bg-white border-zinc-200/80 shadow-xs"
                            : "bg-zinc-50 border-dashed border-zinc-200/80 opacity-70"
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                              isEasyPaisa
                                ? "bg-[#00A859]"
                                : isJazzCash
                                ? "bg-[#ED1C24]"
                                : isBank
                                ? "bg-[#0F141C] text-[#d7b56d]"
                                : "bg-[#2271b1]"
                            }`}
                          >
                            {isBank ? (
                              <Landmark size={18} />
                            ) : (
                              <Smartphone size={18} />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-[14px] text-zinc-900">
                                {account.providerName}
                              </span>
                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  isEasyPaisa
                                    ? "bg-emerald-100 text-emerald-800"
                                    : isJazzCash
                                    ? "bg-red-100 text-red-800"
                                    : isBank
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {account.type}
                              </span>

                              <span
                                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                  account.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {account.isActive ? "Active" : "Disabled"}
                              </span>
                            </div>

                            <div className="text-[13px] text-[#3c434a] font-medium">
                              Account Title: <span className="font-semibold text-zinc-900">{account.accountTitle}</span>
                            </div>

                            <div className="text-[13px] text-[#3c434a]">
                              Account / Phone No: <span className="font-mono font-bold text-zinc-900">{account.accountNumber}</span>
                            </div>

                            {account.iban && (
                              <div className="text-[12px] text-zinc-500">
                                IBAN: <span className="font-mono">{account.iban}</span>
                              </div>
                            )}

                            {account.notes && (
                              <div className="text-[11.5px] text-[#646970] italic">
                                Note: {account.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => handleToggleAccountActive(account.id)}
                            className={`px-2.5 py-1 text-[12px] rounded border font-medium cursor-pointer transition-colors ${
                              account.isActive
                                ? "bg-white text-zinc-500 border-zinc-200/80 hover:bg-[#f0f0f1]"
                                : "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                            }`}
                          >
                            {account.isActive ? "Disable" : "Enable"}
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditAccountModal(account)}
                            className="p-1.5 text-[#2271b1] hover:text-[#135e96] hover:bg-[#f0f0f1] rounded transition-colors cursor-pointer"
                            title="Edit Account"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAccount(account.id)}
                            className="p-1.5 text-rose-600 hover:text-[#b32d2e] hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-zinc-200/80 rounded bg-zinc-50">
                    <CreditCard size={28} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-[13.5px] font-medium text-zinc-900">No payment methods added yet.</p>
                    <p className="text-[12px] text-zinc-500 mt-1 mb-4">Click below to add your first EasyPaisa, JazzCash, or Bank Account.</p>
                    <button
                      type="button"
                      onClick={openAddAccountModal}
                      className="inline-flex items-center gap-1.5 bg-[#2271b1] text-white text-[13px] px-4 py-2 rounded-lg"
                    >
                      <Plus size={15} /> Add Payment Method
                    </button>
                  </div>
                )}
              </div>

              {/* General Payment Instructions */}
              <div className="pt-4 border-t border-zinc-200/80">
                <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                  General Payment Instructions for Guests
                </label>
                <textarea
                  rows={3}
                  value={settings.paymentInstructions || ""}
                  placeholder="e.g. Please transfer the reservation total amount to any of the accounts above and upload your payment screenshot below to confirm your stay."
                  onChange={(e) => handleChange("paymentInstructions", e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
                <span className="text-[11.5px] text-zinc-500 mt-1 block">
                  Displayed prominently above the accounts list and screenshot upload field on the guest booking page.
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div>
                <h2 className="text-[15px] font-semibold text-zinc-900">Automated Email & Staff Alerts</h2>
                <p className="text-[12.5px] text-zinc-500">Configure email dispatch settings for incoming guest reservations.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Admin Notification Recipient Email
                  </label>
                  <input
                    type="email"
                    value={settings.adminAlertEmail}
                    onChange={(e) => handleChange("adminAlertEmail", e.target.value)}
                    className="w-full max-w-md bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                  <span className="text-[11.5px] text-zinc-500 mt-1 block">Staff inbox alerted immediately when a new reservation is placed.</span>
                </div>

                <div className="pt-2 border-t border-zinc-200/80 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sendGuestConfirmationEmail}
                      onChange={(e) => handleChange("sendGuestConfirmationEmail", e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-zinc-200 text-[#2271b1] focus:ring-[#2271b1]"
                    />
                    <div>
                      <strong className="text-[13.5px] text-zinc-900 block">Send Guest Instant Booking Confirmation</strong>
                      <span className="text-[12px] text-zinc-500">Dispatches booking itinerary, check-in dates, and suite details to the guest's email.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sendAdminAlertEmail}
                      onChange={(e) => handleChange("sendAdminAlertEmail", e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-zinc-200 text-[#2271b1] focus:ring-[#2271b1]"
                    />
                    <div>
                      <strong className="text-[13.5px] text-zinc-900 block">Send Internal Staff Booking Alert</strong>
                      <span className="text-[12px] text-zinc-500">Sends an instant notification alert to the hotel management team.</span>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    Custom Email Footer Note
                  </label>
                  <textarea
                    rows={2}
                    value={settings.emailFooterText}
                    onChange={(e) => handleChange("emailFooterText", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Financials & Perks */}
          {activeTab === "financials" && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div>
                <h2 className="text-[15px] font-semibold text-zinc-900">Taxes & Direct Booking Perks</h2>
                <p className="text-[12.5px] text-zinc-500">Adjust tax rates and incentive banners for direct bookings.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                    VAT / Hospitality Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={settings.taxRatePercent}
                    onChange={(e) => handleChange("taxRatePercent", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                  <span className="text-[11.5px] text-zinc-500 mt-1 block">Local hospitality tax included in booking calculation.</span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#dba617]" />
                    <span>Direct Booking Incentive Banner</span>
                  </label>
                  <input
                    type="text"
                    value={settings.directBookingDiscountText}
                    onChange={(e) => handleChange("directBookingDiscountText", e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                  />
                  <span className="text-[11.5px] text-zinc-500 mt-1 block">Highlighted to visitors when browsing accommodations.</span>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-zinc-200/80">
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-[#fcf0f1] border border-[#f0c3c6] rounded-lg">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#d63638] text-rose-600 focus:ring-[#d63638]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-[13.5px]">
                        <ShieldAlert size={15} />
                        <span>Maintenance Mode</span>
                      </div>
                      <span className="text-[12px] text-zinc-500">
                        When enabled, visitors will see a scheduled maintenance notice and online room bookings will be paused.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
            <Info size={14} className="text-zinc-400" />
            <span>Changes take effect immediately across reservations and email templates.</span>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:bg-[#a7aaad] text-white text-[13.5px] font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Add / Edit Payment Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-zinc-200/80 shadow-2xl rounded-xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-200/80 bg-zinc-50 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-zinc-900">
                {editingAccount ? "Edit Payment Method" : "Add Payment Method"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-5 space-y-4">
              {/* Account Type Selector */}
              <div>
                <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                  Account Type *
                </label>
                <select
                  value={accountForm.type}
                  onChange={(e) => handleAccountTypeChange(e.target.value as any)}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="easypaisa">EasyPaisa (Mobile Account)</option>
                  <option value="jazzcash">JazzCash (Mobile Account)</option>
                  <option value="bank">Commercial Bank Account</option>
                  <option value="sadapay">SadaPay</option>
                  <option value="nayapay">NayaPay</option>
                  <option value="custom">Other / Custom Wallet</option>
                </select>
              </div>

              {/* Provider Name */}
              <div>
                <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                  Bank / Wallet Provider Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EasyPaisa, JazzCash, Meezan Bank, HBL"
                  value={accountForm.providerName}
                  onChange={(e) => setAccountForm({ ...accountForm, providerName: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {/* Account Title */}
              <div>
                <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                  Account Title (Account Holder Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Signature Art Hotel or Muhammad Ali"
                  value={accountForm.accountTitle}
                  onChange={(e) => setAccountForm({ ...accountForm, accountTitle: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {/* Account Number / Phone */}
              <div>
                <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                  Account Number / Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0300 1234567 or 01020304050607"
                  value={accountForm.accountNumber}
                  onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {/* Optional IBAN (for bank) */}
              <div>
                <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                  IBAN (Optional, for Bank Transfer / Raast)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PK36MEZN0001020304050607"
                  value={accountForm.iban || ""}
                  onChange={(e) => setAccountForm({ ...accountForm, iban: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {/* Branch / Extra Note */}
              <div>
                <label className="block text-[13px] font-semibold text-zinc-900 mb-1.5">
                  Short Note / Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Send via EasyPaisa app or Mobile banking"
                  value={accountForm.notes || ""}
                  onChange={(e) => setAccountForm({ ...accountForm, notes: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={accountForm.isActive}
                    onChange={(e) => setAccountForm({ ...accountForm, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-200 text-[#2271b1] focus:ring-[#2271b1]"
                  />
                  <span className="text-[13px] font-medium text-zinc-900">
                    Visible on Checkout Page (Active)
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-zinc-200/80 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium bg-zinc-50 hover:bg-[#ececec] text-[#3c434a] border border-zinc-200/80 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-[13px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {editingAccount ? "Update Method" : "Add Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

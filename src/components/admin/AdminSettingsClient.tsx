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
  Sparkles
} from "lucide-react";
import { HotelSettings, saveHotelSettings } from "@/app/actions/admin-settings";

export default function AdminSettingsClient({ initialSettings }: { initialSettings: HotelSettings }) {
  const [settings, setSettings] = useState<HotelSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<"general" | "policies" | "notifications" | "financials">("general");
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

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
    { id: "notifications", label: "Email & Alerts", icon: <Bell size={16} /> },
    { id: "financials", label: "Rates & Direct Perks", icon: <Receipt size={16} /> },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[23px] font-normal text-[#1d2327]">Hotel Settings</h1>
          <p className="text-[13px] text-[#50575e] mt-0.5">
            Configure hotel profile details, booking rules, email notifications, and pricing policies.
          </p>
        </div>
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div
          className={`px-4 py-3 border-l-4 shadow-sm text-[13px] flex items-center justify-between animate-in fade-in duration-150 ${
            statusMsg.type === "success"
              ? "bg-white border-[#00a32a] text-[#1d2327]"
              : "bg-white border-[#d63638] text-[#1d2327]"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === "success" ? (
              <CheckCircle size={16} className="text-[#00a32a]" />
            ) : (
              <AlertCircle size={16} className="text-[#d63638]" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        </div>
      )}

      {/* Settings Form Container */}
      <form onSubmit={handleSave} className="bg-white border border-[#c3c4c7] shadow-sm">
        {/* Horizontal Navigation Tabs */}
        <div className="flex border-b border-[#c3c4c7] bg-[#f6f7f7] overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-[13.5px] font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-[#2271b1] text-[#1d2327] bg-white font-semibold shadow-xs"
                    : "border-transparent text-[#50575e] hover:text-[#2271b1] hover:bg-[#ececec]"
                }`}
              >
                <span className={isActive ? "text-[#2271b1]" : "text-[#8c8f94]"}>{tab.icon}</span>
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
                <h2 className="text-[15px] font-semibold text-[#1d2327]">Property Identity & Contact</h2>
                <p className="text-[12.5px] text-[#50575e]">This information appears on public booking vouchers and guest communications.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Hotel Name <span className="text-[#d63638]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.hotelName}
                    onChange={(e) => handleChange("hotelName", e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => handleChange("tagline", e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Reservations Contact Email <span className="text-[#d63638]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={settings.contactEmail}
                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Contact Phone Number <span className="text-[#d63638]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.contactPhone}
                    onChange={(e) => handleChange("contactPhone", e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Physical Address <span className="text-[#d63638]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Operating Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1]"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="NOK (kr)">NOK (kr)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Hotel Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1]"
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
                <h2 className="text-[15px] font-semibold text-[#1d2327]">Stay Restrictions & Times</h2>
                <p className="text-[12.5px] text-[#50575e]">Control check-in/out scheduling and reservation limits.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Standard Check-in Time
                  </label>
                  <input
                    type="time"
                    value={settings.checkInTime}
                    onChange={(e) => handleChange("checkInTime", e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1]"
                  />
                  <span className="text-[11.5px] text-[#50575e] mt-1 block">Earliest time guests may enter room.</span>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Standard Check-out Time
                  </label>
                  <input
                    type="time"
                    value={settings.checkOutTime}
                    onChange={(e) => handleChange("checkOutTime", e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1]"
                  />
                  <span className="text-[11.5px] text-[#50575e] mt-1 block">Latest departure time before housekeeping.</span>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Minimum Stay (Nights)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={settings.minStayNights}
                    onChange={(e) => handleChange("minStayNights", parseInt(e.target.value) || 1)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Max Advance Booking Window (Days)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={730}
                    value={settings.maxBookingWindowDays}
                    onChange={(e) => handleChange("maxBookingWindowDays", parseInt(e.target.value) || 365)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Cancellation Policy Notice
                  </label>
                  <textarea
                    rows={3}
                    value={settings.cancellationPolicy}
                    onChange={(e) => handleChange("cancellationPolicy", e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1]"
                  />
                  <span className="text-[11.5px] text-[#50575e] mt-1 block">Displayed on guest confirmation and room booking screens.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1d2327]">Automated Email & Staff Alerts</h2>
                <p className="text-[12.5px] text-[#50575e]">Configure email dispatch settings for incoming guest reservations.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Admin Notification Recipient Email
                  </label>
                  <input
                    type="email"
                    value={settings.adminAlertEmail}
                    onChange={(e) => handleChange("adminAlertEmail", e.target.value)}
                    className="w-full max-w-md bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1]"
                  />
                  <span className="text-[11.5px] text-[#50575e] mt-1 block">Staff inbox alerted immediately when a new reservation is placed.</span>
                </div>

                <div className="pt-2 border-t border-[#c3c4c7] space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sendGuestConfirmationEmail}
                      onChange={(e) => handleChange("sendGuestConfirmationEmail", e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]"
                    />
                    <div>
                      <strong className="text-[13.5px] text-[#1d2327] block">Send Guest Instant Booking Confirmation</strong>
                      <span className="text-[12px] text-[#50575e]">Dispatches booking itinerary, check-in dates, and suite details to the guest's email.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sendAdminAlertEmail}
                      onChange={(e) => handleChange("sendAdminAlertEmail", e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]"
                    />
                    <div>
                      <strong className="text-[13.5px] text-[#1d2327] block">Send Internal Staff Booking Alert</strong>
                      <span className="text-[12px] text-[#50575e]">Sends an instant notification alert to the hotel management team.</span>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    Custom Email Footer Note
                  </label>
                  <textarea
                    rows={2}
                    value={settings.emailFooterText}
                    onChange={(e) => handleChange("emailFooterText", e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Financials & Perks */}
          {activeTab === "financials" && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1d2327]">Taxes & Direct Booking Perks</h2>
                <p className="text-[12.5px] text-[#50575e]">Adjust tax rates and incentive banners for direct bookings.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5">
                    VAT / Hospitality Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={settings.taxRatePercent}
                    onChange={(e) => handleChange("taxRatePercent", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1]"
                  />
                  <span className="text-[11.5px] text-[#50575e] mt-1 block">Local hospitality tax included in booking calculation.</span>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[13px] font-semibold text-[#1d2327] mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#dba617]" />
                    <span>Direct Booking Incentive Banner</span>
                  </label>
                  <input
                    type="text"
                    value={settings.directBookingDiscountText}
                    onChange={(e) => handleChange("directBookingDiscountText", e.target.value)}
                    className="w-full bg-white border border-[#8c8f94] rounded-[3px] px-3 py-2 text-[13.5px] text-[#3c434a] focus:outline-none focus:border-[#2271b1]"
                  />
                  <span className="text-[11.5px] text-[#50575e] mt-1 block">Highlighted to visitors when browsing accommodations.</span>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-[#c3c4c7]">
                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-[#fcf0f1] border border-[#f0c3c6] rounded-[3px]">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-[#d63638] text-[#d63638] focus:ring-[#d63638]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-[#d63638] font-semibold text-[13.5px]">
                        <ShieldAlert size={15} />
                        <span>Maintenance Mode</span>
                      </div>
                      <span className="text-[12px] text-[#50575e]">
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
        <div className="p-4 bg-[#f6f7f7] border-t border-[#c3c4c7] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[12px] text-[#50575e]">
            <Info size={14} className="text-[#8c8f94]" />
            <span>Changes take effect immediately across reservations and email templates.</span>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#2271b1] hover:bg-[#135e96] disabled:bg-[#a7aaad] text-white text-[13.5px] font-semibold rounded-[3px] shadow-sm transition-colors cursor-pointer"
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
    </div>
  );
}

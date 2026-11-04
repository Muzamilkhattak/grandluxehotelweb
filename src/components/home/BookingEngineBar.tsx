"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, User, Baby, ChevronLeft, ChevronRight, X } from "lucide-react";

interface BookingEngineBarProps {
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  todayStr: string;
  isMobileView?: boolean;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDisplayDate(isoDate: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }
  return isoDate;
}

export default function BookingEngineBar({
  checkin,
  checkout,
  adults,
  children,
  todayStr,
  isMobileView = false,
}: BookingEngineBarProps) {
  // Dates state (ISO format YYYY-MM-DD for form submission)
  const [checkinDate, setCheckinDate] = useState(checkin || todayStr);

  const defaultCheckout = (() => {
    if (checkout) return checkout;
    const baseDate = checkin || todayStr;
    if (!baseDate) return "";
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  const [checkoutDate, setCheckoutDate] = useState(defaultCheckout);

  // Separate Adults and Children state
  const [adultsCount, setAdultsCount] = useState(adults || 2);
  const [childrenCount, setChildrenCount] = useState(children || 0);

  // Active popover: 'checkin' | 'checkout' | 'adults' | 'children' | null
  const [activePopover, setActivePopover] = useState<"checkin" | "checkout" | "adults" | "children" | null>(null);

  const barRef = useRef<HTMLDivElement>(null);

  // Calendar month/year navigation state
  const [calendarYear, setCalendarYear] = useState(() => {
    const d = new Date(checkin || todayStr || Date.now());
    return d.getFullYear();
  });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date(checkin || todayStr || Date.now());
    return d.getMonth();
  });

  // Close any popover when clicking outside the entire bar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openCalendar = (mode: "checkin" | "checkout") => {
    const targetDate = mode === "checkin" ? checkinDate : checkoutDate;
    if (targetDate) {
      const parts = targetDate.split("-");
      if (parts.length === 3) {
        setCalendarYear(parseInt(parts[0], 10));
        setCalendarMonth(parseInt(parts[1], 10) - 1);
      }
    }
    setActivePopover(activePopover === mode ? null : mode);
  };

  const handleSelectCalendarDate = (dateStr: string) => {
    if (activePopover === "checkin") {
      setCheckinDate(dateStr);
      if (!checkoutDate || checkoutDate <= dateStr) {
        const next = new Date(dateStr);
        next.setDate(next.getDate() + 1);
        const y = next.getFullYear();
        const m = String(next.getMonth() + 1).padStart(2, "0");
        const d = String(next.getDate()).padStart(2, "0");
        setCheckoutDate(`${y}-${m}-${d}`);
      }
      setActivePopover("checkout");
    } else if (activePopover === "checkout") {
      setCheckoutDate(dateStr);
      setActivePopover(null);
    }
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarYear(calendarYear - 1);
      setCalendarMonth(11);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarYear(calendarYear + 1);
      setCalendarMonth(0);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  // Calendar date calculations
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();

  const now = new Date(todayStr || Date.now());
  const isPastMonth =
    calendarYear < now.getFullYear() ||
    (calendarYear === now.getFullYear() && calendarMonth <= now.getMonth());

  // Render Calendar Popover
  const renderCalendarPopover = (isLight: boolean = false) => {
    const isCheckinMode = activePopover === "checkin";
    const popoverPosition = isLight
      ? isCheckinMode
        ? "left-0"
        : "left-auto right-0"
      : isCheckinMode
      ? "left-0"
      : "left-auto right-0 lg:right-auto lg:left-0";

    const containerTheme = isLight
      ? "bg-white border border-zinc-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.16)] text-zinc-900"
      : "bg-[#0c0e12]/95 backdrop-blur-2xl border border-white/25 shadow-[0_24px_60px_rgba(0,0,0,0.75)] text-white";

    const borderTheme = isLight ? "border-zinc-100" : "border-white/10";
    const monthTitleTheme = isLight ? "text-zinc-900" : "text-white";
    const navBtnTheme = isLight
      ? "border-zinc-200 text-zinc-700 hover:border-[#d7b56d]"
      : "border-white/15 text-white hover:border-[#d7b56d]";

    return (
      <div
        className={`absolute top-full mt-2.5 lg:top-auto lg:bottom-full lg:mb-3.5 w-[300px] sm:w-[330px] rounded-2xl p-4 z-50 ${containerTheme} ${popoverPosition}`}
        style={
          !isLight
            ? {
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }
            : undefined
        }
      >
        {/* Header: Mode & Close */}
        <div className={`flex items-center justify-between pb-2 mb-2 border-b ${borderTheme}`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d7b56d] animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-semibold text-[#8f6618] dark:text-[#d7b56d]">
              {isCheckinMode ? "Select Check-in" : "Select Check-out"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActivePopover(null)}
            className="text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between py-1 mb-2">
          <button
            type="button"
            disabled={isPastMonth}
            onClick={handlePrevMonth}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer ${navBtnTheme}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className={`text-sm font-semibold tracking-wide font-jost ${monthTitleTheme}`}>
            {MONTH_NAMES[calendarMonth]} {calendarYear}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${navBtnTheme}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {DAYS_OF_WEEK.map((d) => (
            <span key={d} className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <span key={`empty-${i}`} className="w-8 h-8 sm:w-9 sm:h-9" />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isPast = dateStr < todayStr;
            const isBeforeCheckin = isCheckinMode ? isPast : dateStr <= checkinDate;
            const isCheckin = dateStr === checkinDate;
            const isCheckout = dateStr === checkoutDate;
            const isInRange =
              checkinDate && checkoutDate && dateStr > checkinDate && dateStr < checkoutDate;

            let btnClass = isLight
              ? "text-zinc-800 hover:bg-zinc-100 rounded-lg"
              : "text-white hover:bg-white/15 rounded-lg";

            if (isBeforeCheckin) {
              btnClass = isLight
                ? "text-zinc-300 opacity-40 cursor-not-allowed"
                : "text-zinc-600 opacity-25 cursor-not-allowed";
            } else if (isCheckin || isCheckout) {
              btnClass = "bg-[#d7b56d] text-black font-bold rounded-lg shadow-md";
            } else if (isInRange) {
              btnClass = "bg-[#d7b56d]/20 text-[#8f6618] dark:text-[#d7b56d] rounded-none";
            }

            return (
              <button
                key={day}
                type="button"
                disabled={isBeforeCheckin}
                onClick={() => handleSelectCalendarDate(dateStr)}
                className={`w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm font-medium flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className={`mt-3 pt-2.5 border-t ${borderTheme} flex items-center justify-between text-[11px] text-zinc-500`}>
          <span>
            {toDisplayDate(checkinDate)} → {toDisplayDate(checkoutDate)}
          </span>
          <button
            type="button"
            onClick={() => setActivePopover(null)}
            className="px-3 py-1 bg-[#d7b56d] text-black font-semibold rounded text-[11px] hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // MOBILE VIEW (< lg) ON CLEAN WHITE SECTION BACKGROUND
  // -------------------------------------------------------------
  if (isMobileView) {
    return (
      <div
        ref={barRef}
        className="w-full max-w-xl mx-auto bg-white border border-zinc-200/90 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-3.5 sm:p-4 text-zinc-900"
      >
        <form action="/search" method="GET" className="w-full flex flex-col gap-2.5">
          <input type="hidden" name="checkin" value={checkinDate} />
          <input type="hidden" name="checkout" value={checkoutDate} />
          <input type="hidden" name="adults" value={adultsCount} />
          <input type="hidden" name="children" value={childrenCount} />

          {/* Row 1: Check-in & Check-out */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => openCalendar("checkin")}
                className="w-full p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-zinc-700 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-zinc-500 font-jost font-medium">Check-in</span>
                  <span className="text-[13px] text-zinc-900 font-semibold font-jost">
                    {toDisplayDate(checkinDate)}
                  </span>
                </div>
              </button>
              {activePopover === "checkin" && renderCalendarPopover(true)}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => openCalendar("checkout")}
                className="w-full p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-zinc-700 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-zinc-500 font-jost font-medium">Check-out</span>
                  <span className="text-[13px] text-zinc-900 font-semibold font-jost">
                    {toDisplayDate(checkoutDate)}
                  </span>
                </div>
              </button>
              {activePopover === "checkout" && renderCalendarPopover(true)}
            </div>
          </div>

          {/* Row 2: Adults & Children (Separated) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Adults */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActivePopover(activePopover === "adults" ? null : "adults")}
                className="w-full p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-zinc-700 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-zinc-500 font-jost font-medium">Adults</span>
                  <span className="text-[13px] text-zinc-900 font-semibold font-jost">
                    {adultsCount} Adult{adultsCount > 1 ? "s" : ""}
                  </span>
                </div>
              </button>

              {activePopover === "adults" && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 shadow-2xl p-3.5 z-50 rounded-2xl text-zinc-900">
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-zinc-100">
                    <span className="text-xs font-semibold text-zinc-900">Adults (13+)</span>
                    <button
                      type="button"
                      onClick={() => setActivePopover(null)}
                      className="text-zinc-400 hover:text-zinc-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-1 mb-2">
                    <span className="text-xs text-zinc-600">Count</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={adultsCount <= 1}
                        onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                        className="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center text-zinc-800 disabled:opacity-30 hover:border-[#d7b56d]"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-sm text-zinc-900">{adultsCount}</span>
                      <button
                        type="button"
                        disabled={adultsCount >= 8}
                        onClick={() => setAdultsCount(adultsCount + 1)}
                        className="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center text-zinc-800 hover:border-[#d7b56d]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setActivePopover(null)}
                      className="px-3.5 py-1 bg-[#d7b56d] text-black font-semibold text-xs rounded hover:bg-black hover:text-white transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Children */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActivePopover(activePopover === "children" ? null : "children")}
                className="w-full p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
              >
                <Baby className="w-4 h-4 text-zinc-700 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-zinc-500 font-jost font-medium">Children</span>
                  <span className="text-[13px] text-zinc-900 font-semibold font-jost">
                    {childrenCount} Child{childrenCount === 1 ? "" : "ren"}
                  </span>
                </div>
              </button>

              {activePopover === "children" && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 shadow-2xl p-3.5 z-50 rounded-2xl text-zinc-900">
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-zinc-100">
                    <span className="text-xs font-semibold text-zinc-900">Children (0-12)</span>
                    <button
                      type="button"
                      onClick={() => setActivePopover(null)}
                      className="text-zinc-400 hover:text-zinc-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-1 mb-2">
                    <span className="text-xs text-zinc-600">Count</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={childrenCount <= 0}
                        onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                        className="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center text-zinc-800 disabled:opacity-30 hover:border-[#d7b56d]"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-sm text-zinc-900">{childrenCount}</span>
                      <button
                        type="button"
                        disabled={childrenCount >= 6}
                        onClick={() => setChildrenCount(childrenCount + 1)}
                        className="w-7 h-7 rounded border border-zinc-200 flex items-center justify-center text-zinc-800 hover:border-[#d7b56d]"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setActivePopover(null)}
                      className="px-3.5 py-1 bg-[#d7b56d] text-black font-semibold text-xs rounded hover:bg-black hover:text-white transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#0c0e14] hover:bg-[#d7b56d] text-white hover:text-black font-jost font-bold text-[13px] uppercase tracking-[0.2em] h-[48px] rounded-xl transition-all duration-300 shadow-md flex items-center justify-center active:scale-[0.98] cursor-pointer"
          >
            CHECK RATES
          </button>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DESKTOP VIEW (lg+) ANCHORED INSIDE HERO OVER VIDEO
  // -------------------------------------------------------------
  return (
    <div
      ref={barRef}
      className="w-full max-w-4xl xl:max-w-5xl mx-auto bg-black/40 backdrop-blur-2xl border border-white/25 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] text-white p-3 sm:p-3.5 lg:p-4 ring-1 ring-white/10"
      style={{
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <form action="/search" method="GET" className="w-full">
        {/* Hidden Form Inputs */}
        <input type="hidden" name="checkin" value={checkinDate} />
        <input type="hidden" name="checkout" value={checkoutDate} />
        <input type="hidden" name="adults" value={adultsCount} />
        <input type="hidden" name="children" value={childrenCount} />

        {/* Desktop Single-Row Layout (lg and up) */}
        <div className="flex items-center justify-between w-full">
          {/* 1. Check-in */}
          <div className="relative flex-1 group">
            <button
              type="button"
              onClick={() => openCalendar("checkin")}
              className="w-full flex items-center gap-3 py-2 px-3 lg:px-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-left"
            >
              <Calendar className="w-5 h-5 text-white shrink-0 stroke-[1.6]" />
              <div className="flex flex-col text-left">
                <span className="text-[12px] text-zinc-400 font-jost font-normal leading-tight">
                  Check-in
                </span>
                <span className="text-[14px] lg:text-[15px] xl:text-[16px] text-white font-semibold leading-tight mt-0.5 font-jost tracking-wide">
                  {toDisplayDate(checkinDate)}
                </span>
              </div>
            </button>
            {activePopover === "checkin" && renderCalendarPopover(false)}
          </div>

          {/* Divider */}
          <div className="w-[1px] h-8 bg-white/20 mx-2 lg:mx-3 shrink-0" />

          {/* 2. Check-out */}
          <div className="relative flex-1 group">
            <button
              type="button"
              onClick={() => openCalendar("checkout")}
              className="w-full flex items-center gap-3 py-2 px-3 lg:px-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-left"
            >
              <Calendar className="w-5 h-5 text-white shrink-0 stroke-[1.6]" />
              <div className="flex flex-col text-left">
                <span className="text-[12px] text-zinc-400 font-jost font-normal leading-tight">
                  Check-out
                </span>
                <span className="text-[14px] lg:text-[15px] xl:text-[16px] text-white font-semibold leading-tight mt-0.5 font-jost tracking-wide">
                  {toDisplayDate(checkoutDate)}
                </span>
              </div>
            </button>
            {activePopover === "checkout" && renderCalendarPopover(false)}
          </div>

          {/* Divider */}
          <div className="w-[1px] h-8 bg-white/20 mx-2 lg:mx-3 shrink-0" />

          {/* 3. Adults */}
          <div className="relative flex-1 group">
            <button
              type="button"
              onClick={() => setActivePopover(activePopover === "adults" ? null : "adults")}
              className="w-full flex items-center gap-3 py-2 px-3 lg:px-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-left"
            >
              <User className="w-5 h-5 text-white shrink-0 stroke-[1.6]" />
              <div className="flex flex-col text-left truncate">
                <span className="text-[12px] text-zinc-400 font-jost font-normal leading-tight">
                  Adults
                </span>
                <span className="text-[14px] lg:text-[15px] xl:text-[16px] text-white font-semibold leading-tight mt-0.5 truncate font-jost">
                  {adultsCount} Adult{adultsCount > 1 ? "s" : ""}
                </span>
              </div>
            </button>

            {activePopover === "adults" && (
              <div
                className="absolute bottom-full left-0 mb-3.5 w-64 bg-[#0c0e12]/95 backdrop-blur-2xl border border-white/25 shadow-2xl p-4 z-50 rounded-2xl text-white"
                style={{
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                }}
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-white font-jost">Adults</p>
                    <p className="text-[11px] text-zinc-400">Ages 13 and above</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="text-zinc-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1 mb-3">
                  <span className="text-xs text-zinc-300">Guests</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={adultsCount <= 1}
                      onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                      className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white disabled:opacity-25 hover:border-[#d7b56d] transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{adultsCount}</span>
                    <button
                      type="button"
                      disabled={adultsCount >= 8}
                      onClick={() => setAdultsCount(adultsCount + 1)}
                      className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white hover:border-[#d7b56d] transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="px-3.5 py-1 bg-[#d7b56d] text-black text-xs font-semibold uppercase tracking-wider rounded hover:bg-white transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-[1px] h-8 bg-white/20 mx-2 lg:mx-3 shrink-0" />

          {/* 4. Children */}
          <div className="relative flex-1 group">
            <button
              type="button"
              onClick={() => setActivePopover(activePopover === "children" ? null : "children")}
              className="w-full flex items-center gap-3 py-2 px-3 lg:px-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-left"
            >
              <Baby className="w-5 h-5 text-white shrink-0 stroke-[1.6]" />
              <div className="flex flex-col text-left truncate">
                <span className="text-[12px] text-zinc-400 font-jost font-normal leading-tight">
                  Children
                </span>
                <span className="text-[14px] lg:text-[15px] xl:text-[16px] text-white font-semibold leading-tight mt-0.5 truncate font-jost">
                  {childrenCount} Child{childrenCount === 1 ? "" : "ren"}
                </span>
              </div>
            </button>

            {activePopover === "children" && (
              <div
                className="absolute bottom-full left-0 sm:left-auto sm:right-0 lg:left-auto lg:right-0 mb-3.5 w-64 bg-[#0c0e12]/95 backdrop-blur-2xl border border-white/25 shadow-2xl p-4 z-50 rounded-2xl text-white"
                style={{
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                }}
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-white font-jost">Children</p>
                    <p className="text-[11px] text-zinc-400">Ages 0 to 12</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="text-zinc-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1 mb-3">
                  <span className="text-xs text-zinc-300">Count</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={childrenCount <= 0}
                      onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                      className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white disabled:opacity-25 hover:border-[#d7b56d] transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{childrenCount}</span>
                    <button
                      type="button"
                      disabled={childrenCount >= 6}
                      onClick={() => setChildrenCount(childrenCount + 1)}
                      className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white hover:border-[#d7b56d] transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActivePopover(null)}
                    className="px-3.5 py-1 bg-[#d7b56d] text-black text-xs font-semibold uppercase tracking-wider rounded hover:bg-white transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. CHECK RATES Button */}
          <div className="pl-2 lg:pl-3 shrink-0">
            <button
              type="submit"
              className="bg-white hover:bg-[#d7b56d] text-[#050b14] hover:text-black font-jost font-bold text-[13px] lg:text-[14px] uppercase tracking-[0.2em] px-6 lg:px-8 h-[50px] rounded-xl transition-all duration-300 shadow-md hover:shadow-xl cursor-pointer flex items-center justify-center whitespace-nowrap active:scale-[0.98]"
            >
              CHECK RATES
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

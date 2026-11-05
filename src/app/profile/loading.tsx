import { User, CalendarDays } from "lucide-react";

export default function ProfileLoading() {
  return (
    <main className="pt-[140px] pb-24 min-h-screen bg-[#FFFFFF]">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <h1 className="font-marcellus text-4xl text-[#000000] mb-10 border-b border-[#d7b56d] pb-6 flex items-center gap-3">
          <User className="text-[#d7b56d]" size={36} />
          My Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column Skeleton: Personal Details */}
          <div className="md:col-span-1">
            <div className="bg-white border border-[#d7b56d] p-6 shadow-sm rounded-sm animate-pulse sticky top-[140px]">
              <div className="h-6 w-32 bg-[#d7b56d]/20 rounded mb-6" />
              <div className="space-y-6">
                <div>
                  <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-5 w-40 bg-gray-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-5 w-48 bg-gray-200 rounded" />
                </div>
                <div>
                  <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-[#d7b56d]/30">
                <div className="h-10 w-full bg-gray-100 rounded" />
              </div>
            </div>
          </div>

          {/* Right Column Skeleton: My Reservations */}
          <div className="md:col-span-2">
            <h2 className="font-marcellus text-2xl text-[#000000] mb-6 flex items-center gap-2">
              <CalendarDays className="text-[#d7b56d]" size={24} />
              My Reservations
            </h2>

            <div className="space-y-6 animate-pulse">
              <div className="bg-white border border-[#d7b56d]/40 p-6 flex flex-col sm:flex-row gap-6 shadow-sm">
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-24 bg-[#d7b56d]/20 rounded" />
                  <div className="h-6 w-48 bg-gray-200 rounded" />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="h-4 w-28 bg-gray-100 rounded" />
                    <div className="h-4 w-28 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-20 w-32 bg-gray-100 rounded self-center" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

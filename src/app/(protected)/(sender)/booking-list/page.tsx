

import { MyBookingsList } from "@/webcomponent/sender/my-bookings/MyBookingsList";

export default function Page() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">My Bookings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track and manage your package deliveries in real-time.
        </p>
      </div>

      {/* Single component import that handles everything */}
      <MyBookingsList />
    </main>
  );
}
import { BookingDashboardOverview } from "@/webcomponent/sender/my-bookings/BookingDashboardOverview";
import { MyBookingsList } from "@/webcomponent/sender/my-bookings/MyBookingsList";

export default function Page() {
  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Booking List</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your package deliveries, statistics, and bookings in real-time.
        </p>
      </div>

      {/* 1. Dashboard Stats Cards */}
      <BookingDashboardOverview />

      {/* 2. Filterable Bookings List with Cards Grid */}
      <MyBookingsList />
    </main>
  );
}
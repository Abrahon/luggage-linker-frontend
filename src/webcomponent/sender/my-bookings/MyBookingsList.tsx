"use client";

import React, { useEffect, useState, useCallback } from "react";
import { MyBookingItem, getMyBookings, cancelBooking } from "@/api/booking.api";

import { BookingTimelineModal } from "./BookingTimelineModal";
import { Loader2, PackageX, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { MyBookingCard } from "../card/MyBookingCard";

export const MyBookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<MyBookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState<MyBookingItem | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // Fetch bookings list
  const fetchBookings = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const response = await getMyBookings(page);
      setBookings(response.results);

      // Calculate total pages assuming standard page size of 10 items
      setTotalPages(Math.ceil(response.count / 10) || 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(currentPage);
  }, [currentPage, fetchBookings]);

  // Handle Timeline Modal Open
  const handleOpenTimeline = (booking: MyBookingItem) => {
    setSelectedBooking(booking);
    setIsTimelineOpen(true);
  };

  // Handle Booking Cancellation
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await cancelBooking(bookingId);
      toast.success(response.message || "Booking cancelled successfully.");
      // Refresh list after cancellation
      fetchBookings(currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel booking.");
    }
  };

  // Handle Chat Action
  const handleOpenChat = (booking: MyBookingItem) => {
    toast.info(`Opening chat with traveler: ${booking.traveler_name}`);
  };

  return (
    <section className="w-full space-y-6">
      {/* Content State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-semibold">Loading your bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-16 bg-slate-50 border border-slate-200 rounded-3xl text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <PackageX className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            You don't have any active package bookings right now.
          </p>
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <MyBookingCard
                key={booking.id}
                booking={booking}
                onOpenTimeline={handleOpenTimeline}
                onCancelBooking={handleCancelBooking}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-4 py-2 border border-slate-300 bg-white rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs font-bold text-slate-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-4 py-2 border border-slate-300 bg-white rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Global Modal managed internally */}
      <BookingTimelineModal
        isOpen={isTimelineOpen}
        booking={selectedBooking}
        onClose={() => setIsTimelineOpen(false)}
        onOpenChat={handleOpenChat}
      />
    </section>
  );
};
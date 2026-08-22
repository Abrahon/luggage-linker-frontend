"use client";

import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { MyBookingItem, getMyBookings, cancelBooking } from "@/api/booking.api";
import { BookingTimelineModal } from "./BookingTimelineModal";
import { MyBookingCard } from "../card/MyBookingCard";
import { Loader2, PackageX, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export const MyBookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<MyBookingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination State
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
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
      setBookings(response.results || []);
      setTotalPages(Math.ceil((response.count || 0) / 10) || 1);
    } catch (err: any) {
      Swal.fire({
        title: "Error",
        text: err?.response?.data?.message || "Failed to fetch bookings.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "rounded-3xl font-sans",
          confirmButton: "rounded-xl font-bold px-4 py-2",
        },
      });
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

  // Handle Cancellation
  const handleCancelBooking = async (bookingId: string) => {
    const confirm = await Swal.fire({
      title: "Cancel Booking?",
      text: "Are you sure you want to cancel this booking request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Cancel It",
      customClass: {
        popup: "rounded-3xl font-sans",
        confirmButton: "rounded-xl font-bold px-4 py-2",
        cancelButton: "rounded-xl font-bold px-4 py-2",
      },
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await cancelBooking(bookingId);
      if (res.success) {
        Swal.fire({
          title: "Cancelled!",
          text: res.message || "Booking request cancelled successfully.",
          icon: "success",
          confirmButtonColor: "#f59e0b",
          customClass: {
            popup: "rounded-3xl font-sans",
            confirmButton: "rounded-xl font-bold px-4 py-2",
          },
        });
        fetchBookings(currentPage);
      }
    } catch (err: any) {
      Swal.fire({
        title: "Error",
        text: err?.response?.data?.message || "Failed to cancel booking.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "rounded-3xl font-sans",
          confirmButton: "rounded-xl font-bold px-4 py-2",
        },
      });
    }
  };

  // Handle Chat Action
  const handleOpenChat = (booking: MyBookingItem) => {
    Swal.fire({
      title: "Opening Chat",
      text: `Opening chat with traveler: ${booking.traveler_name || "Traveler"}`,
      icon: "info",
      confirmButtonColor: "#f59e0b",
      customClass: {
        popup: "rounded-3xl font-sans",
        confirmButton: "rounded-xl font-bold px-4 py-2",
      },
    });
  };

  // Filter Bookings by Selected Tab
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING") return b.status.includes("PENDING");
    if (statusFilter === "IN_TRANSIT") return b.status === "IN_TRANSIT" || b.status === "PICKED_UP";
    if (statusFilter === "COMPLETED") return b.status === "COMPLETED" || b.status === "DELIVERED";
    return true;
  });

  return (
    <section className="w-full space-y-6">
      {/* Status Filter Tabs & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "ALL", label: "All Bookings" },
            { id: "PENDING", label: "Pending" },
            { id: "IN_TRANSIT", label: "In Transit" },
            { id: "COMPLETED", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => fetchBookings(currentPage)}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Content State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-semibold">Loading your bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 bg-slate-50 border border-slate-200 rounded-3xl text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <PackageX className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            There are no package bookings matching the selected status filter.
          </p>
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <MyBookingCard
                key={booking.id}
                booking={booking}
                onOpenTimeline={handleOpenTimeline}
                onCancelBooking={handleCancelBooking}
                onRefreshBookings={() => fetchBookings(currentPage)}
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

      {/* Global Timeline Modal */}
      <BookingTimelineModal
        isOpen={isTimelineOpen}
        booking={selectedBooking}
        onClose={() => setIsTimelineOpen(false)}
        onOpenChat={handleOpenChat}
      />
    </section>
  );
};
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  MyBookingItem,
  SenderDashboardStats,
  getMyBookings,
  getSenderDashboardStats,
  cancelBooking,
} from "@/api/booking.api";
// import { MyBookingCard } from "./MyBookingCard";
import { BookingTimelineModal } from "./BookingTimelineModal";
import {
  Clock,
  Package,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  PackageX,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { MyBookingCard } from "../card/MyBookingCard";

export const BookingDashboardOverview: React.FC = () => {
  // Stats & Bookings State
  const [stats, setStats] = useState<SenderDashboardStats | null>(null);
  const [bookings, setBookings] = useState<MyBookingItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Filter & Pagination State
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState<MyBookingItem | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  // 1. Fetch Top Stats
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await getSenderDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load dashboard stats.");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch Bookings List
  const fetchBookings = useCallback(async (page: number) => {
    try {
      setLoadingBookings(true);
      const res = await getMyBookings(page);
      setBookings(res.results || []);
      setTotalPages(Math.ceil(res.count / 10) || 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchBookings(currentPage);
  }, [fetchStats, fetchBookings, currentPage]);

  // Handler: Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await cancelBooking(bookingId);
      toast.success(response.message || "Booking cancelled successfully.");
      fetchStats();
      fetchBookings(currentPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel booking.");
    }
  };

  // Handler: Timeline Modal
  const handleOpenTimeline = (booking: MyBookingItem) => {
    setSelectedBooking(booking);
    setIsTimelineOpen(true);
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
    <section className="w-full space-y-8">
      {/* ---------------------------------------------------------------------- */}
      {/* 1. Statistics Overview Cards                                          */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Requests */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Pending Requests
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loadingStats ? (
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            ) : (
              <span className="text-3xl font-black text-slate-900">
                {stats?.pending_requests ?? 0}
              </span>
            )}
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Active Bookings
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loadingStats ? (
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            ) : (
              <span className="text-3xl font-black text-slate-900">
                {stats?.active_bookings ?? 0}
              </span>
            )}
          </div>
        </div>

        {/* Completed Bookings */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Completed
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loadingStats ? (
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            ) : (
              <span className="text-3xl font-black text-slate-900">
                {stats?.completed_bookings ?? 0}
              </span>
            )}
          </div>
        </div>

        {/* Escrow Held Amount */}
        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Escrow Held
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1.5">
            {loadingStats ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            ) : (
              <>
                <span className="text-3xl font-black text-emerald-400">
                  ${stats?.total_escrow_held.amount ?? "0.00"}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {stats?.total_escrow_held.currency ?? "USD"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. Filter Tabs & Header Actions                                      */}
      {/* ---------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        {/* Status Filter Tabs */}
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

        {/* Refresh Action */}
        <button
          onClick={() => {
            fetchStats();
            fetchBookings(currentPage);
          }}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. Bookings Grid                                                       */}
      {/* ---------------------------------------------------------------------- */}
      {loadingBookings ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-semibold">Loading bookings list...</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
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

      {/* ---------------------------------------------------------------------- */}
      {/* 4. Global Timeline Modal                                              */}
      {/* ---------------------------------------------------------------------- */}
      <BookingTimelineModal
        isOpen={isTimelineOpen}
        booking={selectedBooking}
        onClose={() => setIsTimelineOpen(false)}
        onOpenChat={(b) => toast.info(`Opening chat with traveler: ${b.traveler_name}`)}
      />
    </section>
  );
};
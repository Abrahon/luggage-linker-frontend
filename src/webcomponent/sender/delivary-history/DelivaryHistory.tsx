"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  getDeliveryHistory,
  getDeliveryHistoryStats,
  getDeliveryTimeline,
  DeliveryHistoryItem,
  DeliveryStatsData,
  DeliveryStatus,
  TimelineStepItem,
} from "@/api/delivery.api";

import {
  Search,
  Package,
  CheckCircle2,
  XCircle,
  RotateCcw,
  DollarSign,
  Loader2,
  PackageX,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  ArrowLeft,
  Check,
  X,
  Filter,
  ChevronDown,
  Star,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { getBookingReview, ReviewData } from "@/api/reviews.api";
import { LeaveReviewModal } from "./ReviewModal";
import { CreateReportModal } from "./ReportModal";
import { getMyReports, MyReportListItem } from "@/api/reports.api";

// Date Formatters
const formatTimelineDate = (isoString: string | null) => {
  if (!isoString) return null;
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return null;

    const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    const year = date.toLocaleDateString("en-GB", { year: "numeric" });
    const time = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${day} ${month} ${year} • ${time}`;
  } catch {
    return null;
  }
};

const getStatusBadge = (status: DeliveryStatus) => {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 border-rose-200/80";
    case "REJECTED":
      return "bg-slate-100 text-slate-700 border-slate-300/80";
    case "REFUNDED":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getPaymentBadge = (status: string) => {
  if (status?.toUpperCase() === "PAID") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  return "bg-rose-50 text-rose-700 border-rose-200";
};

const getEscrowBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case "RELEASED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "REFUNDED":
      return "bg-amber-50 text-amber-200";
    case "NOT_FUNDED":
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const FILTER_OPTIONS = [
  { label: "All Deliveries", value: "ALL" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
  { label: "Rejected", value: "REJECTED" },
];

export const DelivaryHistory: React.FC = () => {
  const [stats, setStats] = useState<DeliveryStatsData | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryHistoryItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingList, setLoadingList] = useState(true);

  // Filters & Dropdown
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Timeline Modal State
  const [selectedBooking, setSelectedBooking] = useState<DeliveryHistoryItem | null>(null);
  const [timelineSteps, setTimelineSteps] = useState<TimelineStepItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Review State
  const [existingReview, setExistingReview] = useState<ReviewData | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Report State
  const [userReports, setUserReports] = useState<Record<string, MyReportListItem>>({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingBooking, setReportingBooking] = useState<DeliveryHistoryItem | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await getDeliveryHistoryStats();
      if (res.success) setStats(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load statistics.");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchUserReports = useCallback(async () => {
    try {
      const res = await getMyReports();
      if (res.success && res.results) {
        const reportMap: Record<string, MyReportListItem> = {};
        res.results.forEach((r) => {
          reportMap[r.booking] = r;
        });
        setUserReports(reportMap);
      }
    } catch {
      // Non-blocking report lookup
    }
  }, []);

  const fetchDeliveries = useCallback(async (page: number, status: string, search: string) => {
    try {
      setLoadingList(true);
      const res = await getDeliveryHistory(page, status, search);
      setDeliveries(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10) || 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch delivery history.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  // Fetch Timeline and Existing Review when Modal Opens
  const handleOpenTimeline = async (booking: DeliveryHistoryItem) => {
    setSelectedBooking(booking);
    setTimelineSteps([]);
    setExistingReview(null);
    setLoadingTimeline(true);
    setLoadingReview(true);

    try {
      const res = await getDeliveryTimeline(booking.id);
      if (res?.success && Array.isArray(res.data)) {
        setTimelineSteps(res.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load timeline steps.");
    } finally {
      setLoadingTimeline(false);
    }

    try {
      const res = await getBookingReview(booking.id);
      if (res?.success && res.data) {
        setExistingReview(res.data);
      } else if (Array.isArray(res) && res.length > 0) {
        setExistingReview(res[0]);
      } else if (res?.id) {
        setExistingReview(res);
      }
    } catch {
      setExistingReview(null);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleOpenReportModal = (booking: DeliveryHistoryItem) => {
    setReportingBooking(booking);
    setIsReportModalOpen(true);
  };

  const handleReviewSubmitted = (review: ReviewData) => {
    setExistingReview(review);
    setIsReviewModalOpen(false);
  };

  useEffect(() => {
    fetchStats();
    fetchUserReports();
  }, [fetchStats, fetchUserReports]);

  useEffect(() => {
    fetchDeliveries(currentPage, statusFilter, searchQuery);
  }, [currentPage, statusFilter, searchQuery, fetchDeliveries]);

  const lastCompletedIndex = timelineSteps.reduce((lastIdx, step, idx) => {
    return step.completed ? idx : lastIdx;
  }, -1);

  const currentFilterLabel =
    FILTER_OPTIONS.find((opt) => opt.value === statusFilter)?.label || "All Deliveries";

  return (
    <section className="w-full space-y-8 py-6">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Delivery History</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View all completed and past deliveries.
          </p>
        </div>

        {/* Search & Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tracking, title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 shadow-2xs focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <Filter className="w-4 h-4 text-amber-500" />
              <span>{currentFilterLabel}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl z-30 space-y-0.5">
                {FILTER_OPTIONS.map((option) => {
                  const isSelected = statusFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setCurrentPage(1);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Completed</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-amber-500" /> : <span className="text-3xl font-black text-slate-900">{stats?.completed ?? 0}</span>}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Cancelled</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-amber-500" /> : <span className="text-3xl font-black text-slate-900">{stats?.cancelled ?? 0}</span>}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Refunded</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-amber-500" /> : <span className="text-3xl font-black text-slate-900">${stats?.refunded ?? "0.00"}</span>}
          </div>
        </div>

        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Paid</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            {loadingStats ? <Loader2 className="w-6 h-6 animate-spin text-emerald-400" /> : <span className="text-3xl font-black text-emerald-400">${stats?.total_paid ?? "0.00"}</span>}
          </div>
        </div>
      </div>

      {/* CARDS LIST */}
      {loadingList ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-semibold">Loading delivery history...</p>
        </div>
      ) : deliveries.length === 0 ? (
        <div className="py-16 bg-slate-50 border border-slate-200 rounded-3xl text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <PackageX className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Deliveries Found</h3>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveries.map((item) => {
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.package_image ? (
                          <img
                            src={item.package_image}
                            alt={item.package_title}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                            📦 {item.package_title}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            Tracking: {item.tracking_number}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-500">Traveler:</span>
                      <span className="font-bold text-slate-800">
                        {item.traveler_name || "N/A"}
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">💰 Reward</span>
                        <span className="font-black text-slate-900">
                          ${item.agreed_reward} {item.currency}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">💳 Payment</span>
                        <span
                          className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded border ${getPaymentBadge(
                            item.payment_status
                          )}`}
                        >
                          {item.payment_status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">🔒 Escrow</span>
                        <span
                          className={`font-bold text-[10px] uppercase px-2 py-0.5 rounded border ${getEscrowBadge(
                            item.escrow_status
                          )}`}
                        >
                          {item.escrow_status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Completed: {item.completed_date || "N/A"}</span>
                    </div>
                  </div>

                  {/* ACTION BUTTON ON CARD */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenTimeline(item)}
                      className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold rounded-xl text-xs transition cursor-pointer shadow-2xs"
                    >
                      View Details & Timeline →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-4 py-2 border border-slate-300 bg-white rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-50 transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs font-bold text-slate-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-4 py-2 border border-slate-300 bg-white rounded-xl text-xs font-semibold text-slate-700 disabled:opacity-50 hover:bg-slate-50 transition flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* DYNAMIC TIMELINE & ACTIONS MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                onClick={() => setSelectedBooking(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> ← Back
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Package Brief Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="font-extrabold text-slate-900 text-sm">
                📦 {selectedBooking.package_title}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Traveler</p>
                  <p className="font-bold text-slate-800">
                    {selectedBooking.traveler_name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Reward</p>
                  <p className="font-bold text-slate-800">
                    ${selectedBooking.agreed_reward} {selectedBooking.currency}
                  </p>
                </div>
              </div>
            </div>

            {/* TIMELINE SECTION */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Timeline Progress
              </h3>

              {loadingTimeline ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                  <p className="text-xs font-semibold">Fetching timeline...</p>
                </div>
              ) : timelineSteps.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No timeline steps found.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {timelineSteps.map((step, idx) => {
                    const isCompleted = step.completed;
                    const isCurrent =
                      idx === lastCompletedIndex &&
                      lastCompletedIndex !== timelineSteps.length - 1;

                    return (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isCompleted
                              ? "bg-emerald-500 text-white"
                              : isCurrent
                              ? "bg-blue-600 text-white ring-4 ring-blue-100"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          ) : isCurrent ? (
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          ) : (
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                          )}
                        </div>

                        <p
                          className={`text-xs font-bold ${
                            isCompleted || isCurrent
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </p>

                        {step.timestamp && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatTimelineDate(step.timestamp)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TRAVELER ACTIONS SECTION */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Traveler Actions
              </h3>

              {loadingReview ? (
                <div className="py-4 flex justify-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                </div>
              ) : existingReview ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-amber-900">
                      You rated this traveler {existingReview.rating}★
                    </span>
                  </div>
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="text-amber-700 font-bold underline hover:text-amber-900 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4 fill-slate-900" />
                  <span>Leave Review</span>
                </button>
              )}

              {/* REPORT ACTION BUTTON */}
              {userReports[selectedBooking.id] ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-rose-600" /> Report Submitted
                    </span>
                    <span className="font-mono font-bold text-[10px] bg-rose-200/60 text-rose-800 px-2 py-0.5 rounded uppercase">
                      {userReports[selectedBooking.id].status}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    Reason: {userReports[selectedBooking.id].reason}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => handleOpenReportModal(selectedBooking)}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Report Traveler</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {/* REPORT MODAL */}
      {reportingBooking && (
        <CreateReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setReportingBooking(null);
          }}
          bookingId={reportingBooking.id}
          reportedUserId={
            (reportingBooking as any).traveler ||
            (reportingBooking as any).traveler_id ||
            ""
          }
          travelerName={reportingBooking.traveler_name}
          onReportSubmitted={(newReport) => {
            setUserReports((prev) => ({
              ...prev,
              [reportingBooking.id]: {
                id: newReport.id,
                booking: reportingBooking.id,
                reason: newReport.reason,
                status: newReport.status,
                action_taken: "NONE",
                created_at: newReport.created_at,
              },
            }));
          }}
        />
      )}

      {/* REVIEW MODAL */}
      {selectedBooking && (
        <LeaveReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          booking={{
            id: selectedBooking.id,
            traveler:
              (selectedBooking as any).traveler_id ||
              (typeof (selectedBooking as any).traveler === "string"
                ? (selectedBooking as any).traveler
                : (selectedBooking as any).traveler?.id) ||
              "",
            travelerName: selectedBooking.traveler_name,
            packageTitle: selectedBooking.package_title,
          }}
          existingReview={existingReview}
          onSuccess={handleReviewSubmitted}
        />
      )}
    </section>
  );
};
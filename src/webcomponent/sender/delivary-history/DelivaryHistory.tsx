"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Package,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  MoreVertical,
  Eye,
  Star,
  Flag,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Check,
  Filter,
  User,
} from "lucide-react";

// Import API Types & Functions
import {
  getDeliveryHistory,
  getDeliveryHistoryStats,
  getDeliveryTimeline,
  DeliveryHistoryItem,
  DeliveryStatsData,
  TimelineStepItem,
} from "@/api/delivery.api";

// Import Custom Modals
import { OpenDisputeModal, ViewDisputeModal } from "./DisputeModals";
import { ReportModal } from "./ReportModal";
import { LeaveReviewModal } from "./ReviewModal";

export default function DeliveryHistoryPage() {
  // --- States ---
  const [deliveries, setDeliveries] = useState<DeliveryHistoryItem[]>([]);
  const [stats, setStats] = useState<DeliveryStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Hover Dropdown State
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // Details & Timeline Modal States
  const [activeDetailItem, setActiveDetailItem] = useState<DeliveryHistoryItem | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineStepItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState<boolean>(false);

  // Review Modal State
  const [reviewBookingItem, setReviewBookingItem] = useState<DeliveryHistoryItem | null>(null);

  // Dispute Modals States
  const [disputeBookingOpen, setDisputeBookingOpen] = useState<DeliveryHistoryItem | null>(null);
  const [disputeBookingView, setDisputeBookingView] = useState<DeliveryHistoryItem | null>(null);

  // Report Modal States
  const [reportModalId, setReportModalId] = useState<string | null>(null);
  const [reportedUserId, setReportedUserId] = useState<string | undefined>(undefined);

  // --- Fetch Main Data ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [historyRes, statsRes] = await Promise.all([
        getDeliveryHistory(page, statusFilter, searchQuery),
        getDeliveryHistoryStats(),
      ]);

      setDeliveries(historyRes.results || []);
      setTotalPages(Math.ceil((historyRes.count || 1) / 10));
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch delivery history.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handle Timeline & Details Modal ---
  const handleOpenDetails = async (item: DeliveryHistoryItem) => {
    setActiveDetailItem(item);
    setLoadingTimeline(true);
    try {
      const res = await getDeliveryTimeline(item.id);
      if (res.success) {
        setTimelineData(res.data);
      }
    } catch (err) {
      console.error("Failed to load timeline", err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  return (
    <div className="w-full bg-slate-50/50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Delivery History</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage completed shipments, monitor escrow payouts, and track opened disputes.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          Refresh
        </button>
      </div>

      {/* --- Stats Cards --- */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Completed</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.completed}</h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Cancelled</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.cancelled}</h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <X className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Refunded</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.refunded}</h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Total Paid</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">{stats.total_paid}</h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* --- Search & Dropdown Filter Bar --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        {/* Search Box */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tracking no, package name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Status Select Filter Dropdown */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-52 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* --- Main Table Card --- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent"></div>
            <p className="mt-3 text-xs font-medium text-slate-500">Loading delivery records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">{error}</p>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No delivery items found</h3>
            <p className="text-xs text-slate-500 mt-1">There are no records matching your selected query.</p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Package Details</th>
                  <th className="px-6 py-4">Traveler</th>
                  <th className="px-6 py-4">Delivery Status</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Reward</th>
                  <th className="px-6 py-4">Dispute</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {deliveries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Package Item */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.package_image ? (
                          <img
                            src={item.package_image}
                            alt={item.package_title}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200/60 shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{item.package_title}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.tracking_number}</p>
                        </div>
                      </div>
                    </td>

                    {/* Traveler */}
                    <td className="px-6 py-4 text-slate-700">
                      <span className="font-medium">{item.traveler_name}</span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : item.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                            : "bg-amber-50 text-amber-700 border border-amber-200/60"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === "COMPLETED"
                              ? "bg-emerald-500"
                              : item.status === "CANCELLED"
                              ? "bg-rose-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {item.status_display || item.status}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-semibold">{item.payment_status_display || item.payment_status}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tight">
                          Escrow: {item.escrow_status}
                        </span>
                      </div>
                    </td>

                    {/* Reward */}
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {item.currency} ${item.agreed_reward}
                    </td>

                    {/* Dispute status */}
                    <td className="px-6 py-4">
                      {item.has_dispute ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          {item.dispute_status_display || "Disputed"}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* --- Hover 3-Dot Dropdown Action --- */}
                    <td className="px-6 py-4 text-center">
                      <div
                        className="relative inline-block text-left group"
                        onMouseEnter={() => setHoveredRowId(item.id)}
                        onMouseLeave={() => setHoveredRowId(null)}
                      >
                        <button
                          type="button"
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action Dropdown Card */}
                        {hoveredRowId === item.id && (
                          <div className="absolute right-0 top-full -mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/80 z-30 py-2 animate-in fade-in zoom-in-95 duration-100">
                            {/* 1. View Details (With Timeline & Leave/Report inside) */}
                            <button
                              type="button"
                              onClick={() => {
                                setHoveredRowId(null);
                                handleOpenDetails(item);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-indigo-500" />
                              View Details & Timeline
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            {/* 2. Open / View Dispute */}
                            {item.has_dispute ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setHoveredRowId(null);
                                  setDisputeBookingView(item);
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors text-left cursor-pointer"
                              >
                                <ShieldAlert className="w-4 h-4 text-amber-600" />
                                View Dispute Details
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setHoveredRowId(null);
                                  setDisputeBookingOpen(item);
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                              >
                                <Flag className="w-4 h-4 text-rose-500" />
                                Open Dispute
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200/80 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Showing page <span className="font-semibold text-slate-800">{page}</span> of{" "}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-white shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* --- VIEW DETAILS & TIMELINE MODAL --- */}
      {/* ========================================================================= */}
      {activeDetailItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Delivery Details & Timeline</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{activeDetailItem.tracking_number}</p>
              </div>
              <button
                onClick={() => setActiveDetailItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Container Body */}
            <div className="space-y-5">
              {/* Package Summary Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 flex items-center gap-3">
                {activeDetailItem.package_image ? (
                  <img
                    src={activeDetailItem.package_image}
                    alt={activeDetailItem.package_title}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-200/60 flex items-center justify-center text-slate-400 shrink-0">
                    <Package className="w-7 h-7" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">{activeDetailItem.package_title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Traveler: {activeDetailItem.traveler_name}
                  </p>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    Agreed Payout: {activeDetailItem.currency} ${activeDetailItem.agreed_reward}
                  </p>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Tracking Progress</h4>

                {loadingTimeline ? (
                  <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                    <p className="text-xs text-slate-400 mt-2">Loading checkpoints...</p>
                  </div>
                ) : timelineData.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No tracking steps logged yet.</p>
                ) : (
                  <div className="relative pl-6 space-y-5 my-2 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {timelineData.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            step.completed ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {step.completed ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <h5 className={`text-xs font-bold ${step.completed ? "text-slate-900" : "text-slate-400"}`}>
                            {step.title}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {step.timestamp ? new Date(step.timestamp).toLocaleString() : "Pending"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* --- ACTION BUTTONS (Leave Review & Report Issue / View Report) --- */}
            <div className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2.5">
              {/* Leave Review Button */}
              <button
                type="button"
                onClick={() => {
                  setReviewBookingItem(activeDetailItem);
                  setActiveDetailItem(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all cursor-pointer"
              >
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                Leave Review
              </button>

              {/* Dynamic Check for Existing Report */}
              {(activeDetailItem as Record<string, any>).has_report || (activeDetailItem as Record<string, any>).report_id ? (
                <button
                  type="button"
                  onClick={() => {
                    const existingReportId = (activeDetailItem as Record<string, any>).report_id || activeDetailItem.id;
                    setReportModalId(existingReportId);
                    setActiveDetailItem(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-indigo-600" />
                  View Filed Report
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setReportedUserId(activeDetailItem.traveler);
                    setReportModalId(activeDetailItem.id);
                    setActiveDetailItem(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Flag className="w-4 h-4 text-rose-600" />
                  Report Issue
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- LEAVE / EDIT REVIEW MODAL --- */}
      {reviewBookingItem && (
        <LeaveReviewModal
          isOpen={!!reviewBookingItem}
          onClose={() => setReviewBookingItem(null)}
          booking={{
            id: reviewBookingItem.id,
            traveler: reviewBookingItem.traveler,
            travelerName: reviewBookingItem.traveler_name,
            packageTitle: reviewBookingItem.package_title,
          }}
          existingReview={null}
          onSuccess={() => {
            setReviewBookingItem(null);
            fetchData();
          }}
        />
      )}

      {/* --- REPORT MODAL --- */}
      <ReportModal
        isOpen={!!reportModalId}
        onClose={() => {
          setReportModalId(null);
          setReportedUserId(undefined);
        }}
        bookingId={reportModalId || ""}
        reportedUserId={reportedUserId || ""}
        onSuccess={fetchData}
      />

      {/* --- OPEN DISPUTE MODAL --- */}
      {disputeBookingOpen && (
        <OpenDisputeModal
          isOpen={!!disputeBookingOpen}
          onClose={() => setDisputeBookingOpen(null)}
          bookingId={disputeBookingOpen.id}
          againstUserId={disputeBookingOpen.traveler}
          agreedAmount={parseFloat(disputeBookingOpen.agreed_reward) || 0}
          onDisputeCreated={fetchData}
        />
      )}

      {/* --- VIEW DISPUTE MODAL --- */}
      {disputeBookingView && (
        <ViewDisputeModal
          isOpen={!!disputeBookingView}
          onClose={() => setDisputeBookingView(null)}
          dispute={{
            id: disputeBookingView.id,
            booking: disputeBookingView.id,
            status: disputeBookingView.dispute_status_display || "PENDING",
            disputed_amount: parseFloat(disputeBookingView.agreed_reward) || 0,
            reason: "DAMAGED",
            description: "Dispute opened for this shipment.",
            evidence: [],
          } as any}
          onEvidenceUploaded={fetchData}
        />
      )}
    </div>
  );
}
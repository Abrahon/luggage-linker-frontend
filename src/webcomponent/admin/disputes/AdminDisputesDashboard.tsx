"use client";

import React, { useEffect, useState } from "react";
import {
  DisputeDetailItem,
  getAdminDisputes,
} from "@/api/adminDisputes.api";
import { StatusBadge } from "./StatusBadge";
import { DisputeDetailModal } from "./DisputeDetailModal";
import { Search, RotateCcw, Eye, Loader2 } from "lucide-react";

export const AdminDisputesDashboard = () => {
  const [disputes, setDisputes] = useState<DisputeDetailItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(
    null
  );

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reasonFilter, setReasonFilter] = useState("");
  const [adminFilter, setAdminFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Statistics State
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    underReview: 0,
    waitingUser: 0,
    resolved: 0,
    closed: 0,
  });

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (reasonFilter) params.reason = reasonFilter;
      if (adminFilter) params.assigned_admin = adminFilter;
      if (dateFilter) params.created_at = dateFilter;

      const res = await getAdminDisputes(params);
      const results = res.results || [];
      setDisputes(results);

      // Dynamic calculation for Dashboard Stats if missing from API overview
      const totalCount = res.count ?? results.length;
      const openCount = results.filter((d) => d.status === "OPEN").length;
      const underReviewCount = results.filter((d) => d.status === "UNDER_REVIEW").length;
      const waitingCount = results.filter((d) => d.status === "WAITING_FOR_USER").length;
      const resolvedCount = results.filter((d) => d.status === "RESOLVED").length;
      const closedCount = results.filter((d) => d.status === "CLOSED" || d.status === "REJECTED").length;

      setStats({
        total: totalCount,
        open: openCount,
        underReview: underReviewCount,
        waitingUser: waitingCount,
        resolved: resolvedCount,
        closed: closedCount,
      });
    } catch (err) {
      console.error("Error fetching admin disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter, reasonFilter, adminFilter, dateFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setReasonFilter("");
    setAdminFilter("");
    setDateFilter("");
    fetchDisputes();
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 space-y-8">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Dispute Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Manage, assign, and resolve user dispute claims and escrow allocations.
        </p>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-xs font-medium text-gray-500">Total</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
          <span className="text-xs font-medium text-red-600">Open</span>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.open}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm">
          <span className="text-xs font-medium text-yellow-600">Under Review</span>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {stats.underReview}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm">
          <span className="text-xs font-medium text-orange-600">
            Waiting User
          </span>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {stats.waitingUser}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
          <span className="text-xs font-medium text-emerald-600">Resolved</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {stats.resolved}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
          <span className="text-xs font-medium text-blue-600">Closed</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.closed}</p>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search tracking, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchDisputes()}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">Status ▼</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="WAITING_FOR_USER">Waiting User</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
            </select>

            {/* Reason Dropdown */}
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">Reason ▼</option>
              <option value="DAMAGED">Damaged Item</option>
              <option value="LOST">Lost Package</option>
              <option value="DELAYED">Delivery Delay</option>
            </select>

            {/* Assigned Admin Dropdown */}
            <select
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">Assigned Admin ▼</option>
              <option value="unassigned">Unassigned</option>
              <option value="me">Assigned to Me</option>
            </select>

            {/* Date Input */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            {/* Reset */}
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* 4. Dispute List Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin mr-2 text-emerald-600" />
            Loading disputes...
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Tracking Number</th>
                  <th className="py-3.5 px-4">Sender</th>
                  <th className="py-3.5 px-4">Traveler</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Admin</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {disputes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-8 text-gray-400 text-sm"
                    >
                      No dispute records found matching current filters.
                    </td>
                  </tr>
                ) : (
                  disputes.map((item) => {
                    const createdDate = item.created_at || item.timeline?.opened_at;
                    const trackingNo =
                      typeof item.booking === "object"
                        ? item.booking?.tracking_number
                        : item.booking;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-medium text-gray-900">
                          {trackingNo ? trackingNo.slice(0, 12) + "..." : "N/A"}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.opened_by?.full_name || item.opened_by?.email || "N/A"}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.against_user?.full_name || item.against_user?.email || "N/A"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded font-medium">
                            {item.reason_display || item.reason}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900">
                          ${item.disputed_amount}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3.5 px-4">
                          {item.assigned_admin ? (
                            <span className="text-gray-900 font-medium">
                              {item.assigned_admin.full_name || item.assigned_admin.email}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-500">
                          {createdDate
                            ? new Date(createdDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setSelectedDisputeId(item.id)}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold text-xs bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Detail View Slide-over Modal */}
      <DisputeDetailModal
        disputeId={selectedDisputeId}
        onClose={() => setSelectedDisputeId(null)}
        onRefreshList={fetchDisputes}
      />
    </div>
  );
};
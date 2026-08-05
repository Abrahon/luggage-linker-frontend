"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getAdminReports,
  getAdminReportDetail,
  adminResolveReport,
  MyReportListItem,
  ReportDetailData,
  AdminResolvePayload,
  ReportStatus,
} from "@/api/reports.api";

import {
  MoreVertical,
  Eye,
  Loader2,
  ExternalLink,
  X,
  Send,
  FileText,
  User,
  ShieldAlert,
  ChevronDown,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

type ResolutionCase =
  | "WARNING"
  | "REMOVE_LISTING"
  | "SUSPEND_7"
  | "SUSPEND_30"
  | "PERMANENT_BAN"
  | "INVALID"
  | "ESCALATE";

export const AdminReportsList: React.FC = () => {
  const [reports, setReports] = useState<MyReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Dropdown Action ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal States
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportDetail, setReportDetail] = useState<ReportDetailData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submittingResolution, setSubmittingResolution] = useState(false);

  // Resolution Case Presets
  const [selectedCase, setSelectedCase] = useState<ResolutionCase>("WARNING");
  const [adminNotes, setAdminNotes] = useState("");
  const [banReason, setBanReason] = useState("");
  const [customTrustDeduction, setCustomTrustDeduction] = useState<number>(10);
  const [customSuspendDays, setCustomSuspendDays] = useState<number>(7);

  // Fetch Admin Reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminReports();

      // Unwrap response array across possible backend shapes
      const list: MyReportListItem[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.results)
        ? response.results
        : Array.isArray((response as any)?.data?.results)
        ? (response as any).data.results
        : Array.isArray((response as any)?.data)
        ? (response as any).data
        : [];

      setReports(list);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load admin reports list."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Open Modal & Fetch Details
  const handleOpenDetailModal = async (id: string) => {
    setActiveMenuId(null);
    setSelectedReportId(id);
    setReportDetail(null);
    setLoadingDetail(true);

    // Default values for Case 1 (Warning)
    setSelectedCase("WARNING");
    setAdminNotes("First confirmed violation. Warning issued.");
    setCustomTrustDeduction(10);
    setBanReason("");

    try {
      const res = await getAdminReportDetail(id);
      const detailData = res?.data || (res as unknown as ReportDetailData);
      setReportDetail(detailData);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load report details."
      );
      setSelectedReportId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Sync inputs with Case selection
  const handleCaseChange = (c: ResolutionCase) => {
    setSelectedCase(c);
    switch (c) {
      case "WARNING":
        setAdminNotes("First confirmed violation. Warning issued.");
        setCustomTrustDeduction(10);
        break;
      case "REMOVE_LISTING":
        setAdminNotes("Listing/Booking removed due to policy violation.");
        setCustomTrustDeduction(15);
        break;
      case "SUSPEND_7":
        setAdminNotes("Requested off-platform payment.");
        setCustomTrustDeduction(25);
        setCustomSuspendDays(7);
        break;
      case "SUSPEND_30":
        setAdminNotes("Repeated scam reports.");
        setCustomTrustDeduction(40);
        setCustomSuspendDays(30);
        break;
      case "PERMANENT_BAN":
        setAdminNotes("User permanently removed from marketplace.");
        setBanReason(
          "Multiple verified scam incidents across different bookings."
        );
        break;
      case "INVALID":
        setAdminNotes("Insufficient evidence. No policy violation found.");
        break;
      case "ESCALATE":
        setAdminNotes("Requires legal team review before final decision.");
        break;
    }
  };

  // Execute Resolution via API
  const handleResolveSubmit = async () => {
    if (!selectedReportId) return;

    let payload: AdminResolvePayload;

    switch (selectedCase) {
      case "WARNING":
        payload = {
          status: "RESOLVED",
          is_valid: true,
          action_taken: "WARNING",
          admin_notes: adminNotes || "First confirmed violation. Warning issued.",
          trust_score_deduction: Number(customTrustDeduction),
        };
        break;

      case "REMOVE_LISTING":
        payload = {
          status: "RESOLVED",
          is_valid: true,
          action_taken: "REMOVE_LISTING",
          admin_notes: adminNotes || "Listing or booking removed.",
          trust_score_deduction: Number(customTrustDeduction),
        };
        break;

      case "SUSPEND_7":
      case "SUSPEND_30":
        payload = {
          status: "RESOLVED",
          is_valid: true,
          action_taken: "SUSPEND",
          suspension_days: Number(customSuspendDays),
          admin_notes: adminNotes || "Suspension applied.",
          trust_score_deduction: Number(customTrustDeduction),
        };
        break;

      case "PERMANENT_BAN":
        payload = {
          status: "RESOLVED",
          is_valid: true,
          action_taken: "PERMANENT_BAN",
          ban_reason:
            banReason ||
            "Multiple verified scam incidents across different bookings.",
          admin_notes:
            adminNotes || "User permanently removed from marketplace.",
        };
        break;

      case "INVALID":
        payload = {
          status: "REJECTED",
          is_valid: false,
          action_taken: "NONE",
          admin_notes:
            adminNotes || "Insufficient evidence. No policy violation found.",
        };
        break;

      case "ESCALATE":
        payload = {
          status: "ESCALATED",
          admin_notes:
            adminNotes || "Requires legal team review before final decision.",
        };
        break;
    }

    try {
      setSubmittingResolution(true);
      await adminResolveReport(selectedReportId, payload);
      toast.success(`Report updated successfully (${payload.status}).`);
      setSelectedReportId(null);
      fetchReports();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to submit resolution action."
      );
    } finally {
      setSubmittingResolution(false);
    }
  };

  // Status Badge UI
  const renderStatusBadge = (status: ReportStatus | string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold inline-block">
            RESOLVED
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-bold inline-block">
            REJECTED
          </span>
        );
      case "ESCALATED":
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold inline-block">
            ESCALATED
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-bold inline-block">
            UNDER REVIEW
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-bold inline-block">
            PENDING
          </span>
        );
    }
  };

  // Client-side status filtering
  const filteredReports =
    statusFilter === "ALL"
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  return (
    <div className="w-full space-y-6 py-6 px-4 md:px-8">
      {/* HEADER & FILTER DROPDOWN - FULL WIDTH */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Admin Safety Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review user reports, assign trust deductions, suspensions, or bans.
          </p>
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative inline-block w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ESCALATED">Escalated</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* FULL WIDTH TABLE CONTAINER */}
      <div className="w-full bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-xs font-semibold">Loading admin report list...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No reports found matching criteria.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase border-b border-slate-100 text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Report ID</th>
                  <th className="px-6 py-4">Reporter</th>
                  <th className="px-6 py-4">Reported User</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Action Taken</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    {/* Report ID */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      #{item.id.substring(0, 8)}
                    </td>

                    {/* Reporter Column */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {item.reporter_name || "Anonymous"}
                      </span>
                    </td>

                    {/* Reported User Column */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-rose-600 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        {item.reported_user_name || "Unknown User"}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[11px]">
                        {item.reason}
                      </span>
                    </td>

                    {/* Action Taken */}
                    <td className="px-6 py-4 font-bold text-slate-600">
                      {item.action_taken || "NONE"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">{renderStatusBadge(item.status)}</td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right relative">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenDetailModal(item.id)}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>

                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveMenuId(activeMenuId === item.id ? null : item.id)
                            }
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* 3-Dot Action Menu */}
                          {activeMenuId === item.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 p-1">
                              <button
                                onClick={() => handleOpenDetailModal(item.id)}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                              >
                                Resolve Report
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STANDARD MAX-WIDTH MODAL */}
      {selectedReportId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">
                  Report Detail & Enforcement
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {selectedReportId}
                </p>
              </div>
              <button
                onClick={() => setSelectedReportId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                <p className="text-xs font-semibold">Loading details...</p>
              </div>
            ) : reportDetail ? (
              <div className="space-y-6">
                {/* Details Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 font-bold block">Reason</span>
                      <p className="font-extrabold text-slate-900 text-sm">
                        {reportDetail.reason}
                      </p>
                    </div>
                    <div>{renderStatusBadge(reportDetail.status)}</div>
                  </div>

                  {/* Reporter & Reported User Summary */}
                  <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200/60">
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">
                        Reported By
                      </span>
                      <p className="font-bold text-slate-800">
                        {reportDetail.reporter_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">
                        Reported User
                      </span>
                      <p className="font-bold text-rose-600">
                        {reportDetail.reported_user_name || "N/A"}
                      </p>
                    </div>
                  </div>

                  {reportDetail.description && (
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">
                        Description
                      </span>
                      <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed font-medium">
                        {reportDetail.description}
                      </p>
                    </div>
                  )}

                  {/* Evidence Files */}
                  {reportDetail.evidence_files &&
                    reportDetail.evidence_files.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">
                          Attached Evidence
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {reportDetail.evidence_files.map((fileObj) => (
                            <a
                              key={fileObj.id}
                              href={fileObj.file}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:border-amber-400 transition"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-500" />
                              <span>View File</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Case Selector Grid */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">
                    Choose Resolution Action Preset
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: "WARNING", label: "Case 1: Warning (-10)" },
                      { key: "REMOVE_LISTING", label: "Case 2: Remove Listing (-15)" },
                      { key: "SUSPEND_7", label: "Case 3: Suspend 7 Days (-25)" },
                      { key: "SUSPEND_30", label: "Case 4: Suspend 30 Days (-40)" },
                      { key: "PERMANENT_BAN", label: "Case 5: Permanent Ban" },
                      { key: "INVALID", label: "Case 6: Invalid / Reject" },
                      { key: "ESCALATE", label: "Case 7: Escalate Legal" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleCaseChange(item.key as ResolutionCase)}
                        className={`p-3 rounded-2xl border text-xs font-bold text-left transition cursor-pointer ${
                          selectedCase === item.key
                            ? "border-amber-500 bg-amber-50 text-slate-900 ring-2 ring-amber-500/20"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Configurable Action Fields */}
                <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  {(selectedCase === "SUSPEND_7" ||
                    selectedCase === "SUSPEND_30") && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Suspension Days
                        </label>
                        <input
                          type="number"
                          value={customSuspendDays}
                          onChange={(e) =>
                            setCustomSuspendDays(Number(e.target.value))
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Trust Score Deduction
                        </label>
                        <input
                          type="number"
                          value={customTrustDeduction}
                          onChange={(e) =>
                            setCustomTrustDeduction(Number(e.target.value))
                          }
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  {(selectedCase === "WARNING" || selectedCase === "REMOVE_LISTING") && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Trust Score Deduction
                      </label>
                      <input
                        type="number"
                        value={customTrustDeduction}
                        onChange={(e) =>
                          setCustomTrustDeduction(Number(e.target.value))
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden"
                      />
                    </div>
                  )}

                  {selectedCase === "PERMANENT_BAN" && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Ban Reason
                      </label>
                      <input
                        type="text"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Reason for permanent removal..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-hidden"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Admin Notes
                    </label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Write internal resolution notes..."
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReportId(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingResolution}
                    onClick={handleResolveSubmit}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingResolution ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Apply Resolution</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
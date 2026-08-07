"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  AlertTriangle,
  Loader2,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertOctagon,
} from "lucide-react";
import {
  getReportDetail,
  getMyReports,
  ReportDetailData,
  ReportStatus,
} from "@/api/reports.api";

interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string; // Can be Report UUID or Booking UUID
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  isOpen,
  onClose,
  reportId,
}) => {
  const [report, setReport] = useState<ReportDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  const fetchReportData = useCallback(async () => {
    if (!reportId) return;

    setLoading(true);
    setNotFound(false);
    setReport(null);

    // 1. Direct Lookup via Report UUID
    try {
      const directRes = await getReportDetail(reportId);
      if (directRes && directRes.data) {
        setReport(directRes.data);
        setLoading(false);
        return;
      }
    } catch (err) {
      // 404 Expected if reportId passed is actually a Booking ID
    }

    // 2. Fallback Lookup via User's Report List
    try {
      const myReportsRes = await getMyReports();
      const reportList = myReportsRes?.data || myReportsRes?.results || [];

      // Check if reportId matches an item's ID or booking ID
      for (const item of reportList) {
        if (item.id === reportId || item.booking === reportId) {
          const detailRes = await getReportDetail(item.id);
          if (detailRes && detailRes.data) {
            setReport(detailRes.data);
            setLoading(false);
            return;
          }
        }
      }
    } catch (fallbackErr) {
      console.error("Failed fallback lookup for report details:", fallbackErr);
    }

    setNotFound(true);
    setLoading(false);
  }, [reportId]);

  useEffect(() => {
    if (isOpen && reportId) {
      fetchReportData();
    }
  }, [isOpen, reportId, fetchReportData]);

  if (!isOpen) return null;

  const renderStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Under Review
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      case "ESCALATED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <AlertOctagon className="w-3.5 h-3.5" /> Escalated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="font-extrabold text-slate-900 text-base">Report Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-xs font-semibold">Retrieving report details...</p>
          </div>
        ) : notFound || !report ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Existing Report Found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              No formal report record was found for this reference.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Status Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Report Case ID:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {report.id}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Status:</span>
                {renderStatusBadge(report.status)}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Action Taken:</span>
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  {report.action_taken || "NONE"}
                </span>
              </div>

              {report.reported_user_name && (
                <div className="flex justify-between items-center border-t border-slate-200/60 pt-2 mt-2">
                  <span className="text-slate-500 font-medium">Reported User:</span>
                  <span className="font-bold text-slate-800">
                    {report.reported_user_name}
                  </span>
                </div>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                Reason
              </label>
              <div className="font-bold text-rose-800 bg-rose-50/70 px-3 py-2.5 rounded-xl border border-rose-100">
                {report.reason ? report.reason.replace(/_/g, " ") : "N/A"}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                Description
              </label>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80 whitespace-pre-wrap leading-relaxed">
                {report.description || "No description provided."}
              </p>
            </div>

            {/* Evidence Files */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                Attached Evidence ({report.evidence_files?.length || 0})
              </label>

              {report.evidence_files && report.evidence_files.length > 0 ? (
                <div className="space-y-2">
                  {report.evidence_files.map((item, idx) => (
                    <a
                      key={item.id || idx}
                      href={item.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition text-slate-700 font-semibold"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="truncate">Evidence File #{idx + 1}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-[11px] p-3 bg-slate-50 rounded-xl border border-slate-100">
                  No evidence files attached to this report.
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
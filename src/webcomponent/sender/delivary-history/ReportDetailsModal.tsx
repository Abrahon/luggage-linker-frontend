"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  AlertTriangle,
  Loader2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { getReportDetail, ReportDetailData } from "@/api/reports.api"; // Adjust import path if needed

interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  isOpen,
  onClose,
  reportId,
}) => {
  const [report, setReport] = useState<ReportDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !reportId) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        // Calling API function from report api file
        const res = await getReportDetail(reportId);
        
        if (res.data) {
          setReport(res.data);
        } else if (res as unknown as ReportDetailData) {
          // Fallback if backend returns direct object without { data: ... } wrapper
          setReport(res as unknown as ReportDetailData);
        }
      } catch (err: any) {
        toast.error("Failed to load report details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, reportId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="font-black text-slate-900 text-lg">Report Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <p className="text-xs font-semibold">Loading report details...</p>
          </div>
        ) : !report ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            Unable to find details for this report.
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-xs">
            {/* Status & ID Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Case ID:</span>
                <span className="font-mono font-bold text-slate-800">
                  {report.id}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase text-[10px]">
                  {report.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Action Taken:</span>
                <span className="font-bold text-slate-700 uppercase text-[10px]">
                  {report.action_taken || "NONE"}
                </span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Reason
              </label>
              <div className="font-bold text-slate-800 bg-rose-50 text-rose-700 px-3 py-2 rounded-xl border border-rose-100">
                {report.reason}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </label>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
                {report.description}
              </p>
            </div>

            {/* Evidence Files */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Evidence Files ({report.evidence_files?.length || 0})
              </label>

              {report.evidence_files && report.evidence_files.length > 0 ? (
                <div className="space-y-1.5 mt-1">
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
                <p className="text-slate-400 italic text-[11px] p-2 bg-slate-50 rounded-xl border border-slate-100">
                  No evidence files attached.
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
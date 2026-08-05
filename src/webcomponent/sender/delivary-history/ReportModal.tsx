"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Upload,
  CheckCircle2,
  Loader2,
  FileText,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createReport,
  ReportReason,
  CreateReportResponseData,
} from "@/api/reports.api";

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  reportedUserId: string;
  travelerName?: string;
  onReportSubmitted?: (data: CreateReportResponseData) => void;
}

const REASON_OPTIONS: { label: string; value: ReportReason }[] = [
  { label: "Scam / Fraud", value: "SCAM" },
  { label: "Requested Off-platform Payment", value: "OFF_PLATFORM_PAYMENT" },
  { label: "Harassment or Abusive Behavior", value: "HARASSMENT" },
  { label: "Fake Identity / Impersonation", value: "FAKE_IDENTITY" },
  { label: "Package Damage / Theft", value: "DAMAGE" },
  { label: "Unreasonable Delay", value: "DELAY" },
  { label: "Other Issue", value: "OTHER" },
];

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  reportedUserId,
  travelerName = "Traveler",
  onReportSubmitted,
}) => {
  const [reason, setReason] = useState<ReportReason>("SCAM");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [createdReport, setCreatedReport] =
    useState<CreateReportResponseData | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Prevent sending request if reportedUserId is null, empty, or missing
    if (!reportedUserId || reportedUserId.trim() === "") {
      toast.error(
        "Traveler information is missing. Unable to file a report for this booking."
      );
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description of the incident.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createReport({
        booking: bookingId,
        reported_user: reportedUserId,
        reason,
        description: description.trim(),
        evidence_files: files,
      });

      if (res.success && res.data) {
        setCreatedReport(res.data);
        toast.success(res.message || "Report submitted successfully.");
        if (onReportSubmitted) {
          onReportSubmitted(res.data);
        }
      } else {
        toast.error("Failed to submit report.");
      }
    } catch (err: any) {
      const fieldError =
        err?.response?.data?.reported_user?.[0] ||
        err?.response?.data?.booking?.[0] ||
        err?.response?.data?.reason?.[0] ||
        err?.response?.data?.message ||
        err?.response?.data?.detail;

      toast.error(
        fieldError ? `Error: ${fieldError}` : "An error occurred while submitting the report."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setCreatedReport(null);
    setDescription("");
    setFiles([]);
    setReason("SCAM");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="font-black text-slate-900 text-lg">
              Report {travelerName}
            </h2>
          </div>
          <button
            onClick={handleCloseModal}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdReport ? (
          /* SUCCESS STATE */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                Report Submitted Successfully
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Our Trust &amp; Safety team will review your report and take appropriate action.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Case ID:</span>
                <span className="font-mono font-bold text-slate-800">
                  {createdReport.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase text-[10px]">
                  {createdReport.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Reason:</span>
                <span className="font-semibold text-slate-700">
                  {createdReport.reason}
                </span>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-2xs"
            >
              Done
            </button>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Reason for Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-semibold text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-hidden cursor-pointer"
              >
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened in detail (e.g. asked for off-platform payment, failed to deliver)..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 shadow-2xs focus:border-rose-500 focus:outline-hidden resize-none"
              />
            </div>

            {/* Evidence Files Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Upload Evidence (Screenshots, Photos)
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition relative">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-1">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700">
                    Click to upload evidence files
                  </p>
                  <p className="text-[10px] text-slate-400">
                    PNG, JPG, PDF up to 10MB each
                  </p>
                </div>
              </div>

              {/* Uploaded File Previews */}
              {files.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700 truncate">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
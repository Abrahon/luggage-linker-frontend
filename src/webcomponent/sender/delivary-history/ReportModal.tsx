"use client";

import React, { useState } from "react";
import { X, Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { createReport, ReportReason } from "@/api/reports.api";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName?: string;
  bookingId?: string;
  onSuccess?: () => void;
}

const REASON_OPTIONS: { label: string; value: ReportReason }[] = [
  { label: "Scam or Fraud", value: "SCAM" },
  { label: "Harassment or Threat", value: "HARASSMENT" },
  { label: "Abusive Language / Behavior", value: "ABUSE" },
  { label: "Fake Profile / Identity", value: "FAKE_IDENTITY" },
  { label: "Off-Platform Payment Request", value: "OFF_PLATFORM_PAYMENT" },
  { label: "Inappropriate Behavior", value: "INAPPROPRIATE_BEHAVIOR" },
  { label: "Other Issues", value: "OTHER" },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  bookingId,
  onSuccess,
}) => {
  const [reason, setReason] = useState<ReportReason>("SCAM");
  const [description, setDescription] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setEvidenceFiles((prev) => [...prev, ...selected].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (description.trim().length < 15) {
      setErrorMessage("Please provide a description of at least 15 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await createReport({
        reported_user: reportedUserId,
        booking: bookingId,
        reason,
        description,
        evidence_files: evidenceFiles,
      });

      if (res.success || res.data) {
        setSuccessMessage("Report submitted successfully.");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      const responseData = err?.response?.data;

      // Unpack DRF Serializer Errors
      if (responseData) {
        if (typeof responseData === "string") {
          setErrorMessage(responseData);
        } else if (responseData.detail) {
          setErrorMessage(responseData.detail);
        } else if (responseData.non_field_errors) {
          setErrorMessage(
            Array.isArray(responseData.non_field_errors)
              ? responseData.non_field_errors[0]
              : responseData.non_field_errors
          );
        } else if (responseData.description) {
          setErrorMessage(
            Array.isArray(responseData.description)
              ? responseData.description[0]
              : responseData.description
          );
        } else if (responseData.booking) {
          setErrorMessage(
            Array.isArray(responseData.booking)
              ? responseData.booking[0]
              : responseData.booking
          );
        } else {
          setErrorMessage("Failed to submit report. Please check your entries.");
        }
      } else {
        setErrorMessage("A network error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-900 text-base">
            Submit Report {reportedUserName ? `against ${reportedUserName}` : ""}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMessage}
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Reason Selection */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Reason for Report <span className="text-rose-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ReportReason)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
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
            <div className="flex justify-between mb-1">
              <label className="text-slate-700 font-bold">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[10px] ${
                  description.length >= 15 ? "text-slate-400" : "text-amber-600 font-semibold"
                }`}
              >
                {description.length}/15 min chars
              </span>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe what happened in detail..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-normal focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {/* Evidence Uploads */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Evidence Files (Optional, max 5)
            </label>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-rose-400 bg-slate-50 rounded-2xl cursor-pointer transition">
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-slate-600 font-medium text-[11px]">
                Click to attach photos or documents
              </span>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf"
              />
            </label>

            {/* File List */}
            {evidenceFiles.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {evidenceFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700 font-medium"
                  >
                    <span className="truncate max-w-[240px] text-[11px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
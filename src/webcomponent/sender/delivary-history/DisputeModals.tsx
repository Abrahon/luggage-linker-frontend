"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  Upload,
  Loader2,
  FileText,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  createDispute,
  uploadDisputeEvidence,
  DisputeItem,
} from "@/api/disputes.api";

// --- REASON OPTIONS ---
const DISPUTE_REASONS = [
  { value: "DAMAGED", label: "Items Damaged Upon Delivery" },
  { value: "MISSING", label: "Items Missing or Incomplete" },
  { value: "LATE_DELIVERY", label: "Extreme Delay in Delivery" },
  { value: "UNPROFESSIONAL", label: "Unprofessional Conduct" },
  { value: "OTHER", label: "Other Issue" },
];

const EVIDENCE_TYPES = [
  { value: "DAMAGE_PHOTO", label: "Damage Photo" },
  { value: "RECEIPT", label: "Receipt / Invoice" },
  { value: "CHAT_SCREENSHOT", label: "Chat Screenshot" },
  { value: "OTHER", label: "Other Document" },
];

interface OpenDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  againstUserId: string;
  agreedAmount: number;
  onDisputeCreated: () => void;
}

export const OpenDisputeModal: React.FC<OpenDisputeModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  againstUserId,
  agreedAmount,
  onDisputeCreated,
}) => {
  const [reason, setReason] = useState("DAMAGED");
  const [description, setDescription] = useState("");
  const [disputedAmount, setDisputedAmount] = useState<number>(agreedAmount);
  const [file, setFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState("DAMAGE_PHOTO");
  const [evidenceDesc, setEvidenceDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Please enter a detailed description of the issue.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Create the dispute
      const response = await createDispute({
        booking_id: bookingId,
        against_user: againstUserId,
        reason,
        description,
        disputed_amount: Number(disputedAmount),
      });

      const disputeId = response.id || response.data?.id;

      // 2. Upload evidence if attached
      if (disputeId && file) {
        try {
          await uploadDisputeEvidence(
            disputeId,
            file,
            evidenceType,
            evidenceDesc || description
          );
        } catch {
          toast.warning("Dispute created, but evidence upload failed.");
        }
      }

      toast.success("Dispute opened successfully. Our team will review it.");
      onDisputeCreated();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to submit dispute."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
            <ShieldAlert className="w-5 h-5" />
            <span>⚖ Open a Dispute</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Reason Selection */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700">
              Dispute Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800 focus:border-amber-500 focus:outline-hidden"
            >
              {DISPUTE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700">
              Disputed Amount ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={disputedAmount}
              onChange={(e) => setDisputedAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened with your item or delivery..."
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800 focus:border-amber-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* File Attachment Section */}
          <div className="border-t border-slate-100 pt-3 space-y-3">
            <label className="font-extrabold text-slate-700 block">
              Evidence Attachment (Optional)
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Evidence Type
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-800"
                >
                  {EVIDENCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  File
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold"
                />
              </div>
            </div>

            {file && (
              <input
                type="text"
                placeholder="Short description for evidence (e.g., Cracked screen photo)"
                value={evidenceDesc}
                onChange={(e) => setEvidenceDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs"
              />
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Dispute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ViewDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispute: DisputeItem;
  onEvidenceUploaded?: () => void;
}

export const ViewDisputeModal: React.FC<ViewDisputeModalProps> = ({
  isOpen,
  onClose,
  dispute,
  onEvidenceUploaded,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState("DAMAGE_PHOTO");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !dispute) return null;

  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      setIsUploading(true);
      await uploadDisputeEvidence(dispute.id, file, evidenceType, description);
      toast.success("Evidence uploaded successfully.");
      setFile(null);
      setDescription("");
      if (onEvidenceUploaded) onEvidenceUploaded();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload evidence.");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const upper = status?.toUpperCase();
    if (upper === "RESOLVED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (upper === "REJECTED") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-slate-900 text-base">
              Dispute Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispute Summary Header */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                dispute.status
              )}`}
            >
              {dispute.status_display || dispute.status}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              Amount: ${dispute.disputed_amount}
            </span>
          </div>

          <div className="text-xs space-y-1">
            <p className="text-slate-500">
              <strong className="text-slate-800">Reason:</strong>{" "}
              {dispute.reason_display || dispute.reason}
            </p>
            {dispute.resolution && (
              <p className="text-emerald-700 font-bold">
                Resolution: {dispute.resolution_display || dispute.resolution}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Statement
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            {dispute.description}
          </p>
        </div>

        {/* Evidence List */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Attached Evidence ({dispute.evidence?.length || 0})
          </h4>
          {dispute.evidence && dispute.evidence.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {dispute.evidence.map((ev) => (
                <a
                  key={ev.id}
                  href={ev.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <ImageIcon className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-bold text-slate-800 truncate">
                      {ev.evidence_type_display || ev.evidence_type}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      — {ev.description}
                    </span>
                  </div>
                  <span className="text-amber-600 font-bold shrink-0 text-[11px]">
                    View
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No evidence uploaded yet.</p>
          )}
        </div>

        {/* Upload Additional Evidence */}
        <form
          onSubmit={handleUploadEvidence}
          className="border-t border-slate-100 pt-4 space-y-3"
        >
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Upload Additional Evidence
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-800"
            >
             {EVIDENCE_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold"
            />
          </div>

          <input
            type="text"
            placeholder="Evidence note..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs"
          />

          <button
            type="submit"
            disabled={isUploading || !file}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload File
          </button>
        </form>
      </div>
    </div>
  );
};
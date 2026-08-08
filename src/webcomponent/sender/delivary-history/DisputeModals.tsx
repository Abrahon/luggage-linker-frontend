"use client";

import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  Upload,
  Loader2,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Package,
  Hash,
  DollarSign,
  User,
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

// --- EVIDENCE TYPE OPTIONS ---
const EVIDENCE_TYPES = [
  { value: "DAMAGE_PHOTO", label: "Damage / Item Photo" },
  { value: "RECEIPT", label: "Receipt / Invoice" },
  { value: "CHAT_LOG", label: "Chat Log / Screenshot" },
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

        // Handle direct object response or Axios data wrapper
        const disputeId = response?.id || (response as any)?.data?.id;

        // 2. Upload initial evidence if attached
        if (disputeId && file) {
          try {
            await uploadDisputeEvidence(
              disputeId,
              file,
              evidenceType,
              evidenceDesc.trim() || description
            );
          } catch (uploadErr) {
            console.error("Evidence upload error:", uploadErr);
            toast.warning("Dispute created, but initial evidence upload failed.");
          }
        }

        toast.success("Dispute submitted successfully. Support has been notified.");
        onDisputeCreated();
        onClose();
      } catch (err: any) {
        // Extract non_field_errors or general backend messages
        const nonFieldErrors = err?.response?.data?.non_field_errors;
        const genericMsg = err?.response?.data?.detail || err?.response?.data?.message;

        // Intercept the ledger/payment error and render the clear message
        if (
          nonFieldErrors &&
          Array.isArray(nonFieldErrors) &&
          nonFieldErrors.some((e: string) => e.includes("Financial ledger") || e.includes("Payment not logged"))
        ) {
          toast.error("Disputes can only be opened for completed deliveries with logged payment.");
        } else if (nonFieldErrors && nonFieldErrors.length > 0) {
          toast.error(nonFieldErrors[0]);
        } else {
          toast.error(genericMsg || "Failed to submit dispute. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    };
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
            <ShieldAlert className="w-5 h-5" />
            <span>Open a Dispute Claim</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Dispute Reason */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 block">
              Dispute Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-hidden"
            >
              {DISPUTE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 block">
              Disputed Amount ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <DollarSign className="w-4 h-4" />
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={disputedAmount}
                onChange={(e) => setDisputedAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 font-semibold text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Statement / Description */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-700 block">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what went wrong with the delivery or item..."
              className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-hidden resize-none"
            />
          </div>

          {/* Evidence Upload Section */}
          <div className="border-t border-slate-100 pt-3 space-y-3">
            <label className="font-extrabold text-slate-700 block">
              Attach Proof / Evidence (Optional)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Evidence Type
                </label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-800 focus:border-rose-500 focus:outline-hidden"
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
                  File Attachment
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-rose-50 file:text-rose-700 file:font-semibold hover:file:bg-rose-100"
                />
              </div>
            </div>

            {file && (
              <input
                type="text"
                placeholder="Brief note for this file (e.g., Damage photo on box)..."
                value={evidenceDesc}
                onChange={(e) => setEvidenceDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden"
              />
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold border border-slate-200 hover:bg-slate-50 cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
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

  // Extract nested booking information
  const bookingObj = typeof dispute.booking === "object" ? dispute.booking : null;
  const trackingNumber =
    bookingObj?.tracking_number || (typeof dispute.booking === "string" ? dispute.booking : "N/A");
  const packageName =
    bookingObj?.package_details || bookingObj?.package_name || "Shipment Package";

  // Extract user info
  const openedByName = dispute.opened_by?.full_name || dispute.opened_by?.email || "User";

  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      setIsUploading(true);
      await uploadDisputeEvidence(
        dispute.id,
        file,
        evidenceType,
        description.trim() || "Additional Evidence"
      );
      toast.success("Evidence uploaded successfully.");
      setFile(null);
      setDescription("");
      if (onEvidenceUploaded) onEvidenceUploaded();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to upload evidence."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string, display?: string) => {
    const upper = status?.toUpperCase();
    if (upper === "RESOLVED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (upper === "REJECTED" || upper === "CLOSED") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-slate-900 text-base">
              Dispute Summary #{dispute.id.slice(0, 8)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispute Card Overview */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                dispute.status,
                dispute.status_display
              )}`}
            >
              ● {dispute.status_display || dispute.status}
            </span>
            <span className="font-mono font-extrabold text-emerald-600 text-sm">
              ${Number(dispute.disputed_amount).toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
            <div>
              <span className="text-slate-400 font-bold block mb-0.5 flex items-center gap-1">
                <Package className="w-3 h-3" /> Package
              </span>
              <span className="font-semibold text-slate-800 truncate block">
                {packageName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-0.5 flex items-center gap-1">
                <Hash className="w-3 h-3" /> Tracking
              </span>
              <span className="font-mono text-slate-700 truncate block">
                {trackingNumber}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 font-bold block mb-0.5 flex items-center gap-1">
                <User className="w-3 h-3" /> Opened By
              </span>
              <span className="font-medium text-slate-800 truncate block">
                {openedByName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block mb-0.5">Reason</span>
              <span className="font-medium text-slate-800 block">
                {dispute.reason_display || dispute.reason}
              </span>
            </div>
          </div>

          {dispute.resolution && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-emerald-700 font-bold block">
                Resolution: {dispute.resolution_display || dispute.resolution}
              </span>
            </div>
          )}
        </div>

        {/* Description Statement */}
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Statement
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            {dispute.description || "No description provided."}
          </p>
        </div>

        {/* Attached Evidence List */}
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
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/30 transition text-xs group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {ev.evidence_type === "DAMAGE_PHOTO" || ev.evidence_type === "IMAGE" ? (
                      <ImageIcon className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <div className="truncate">
                      <span className="font-bold text-slate-800 block truncate">
                        {ev.evidence_type_display || ev.evidence_type}
                      </span>
                      {ev.description && (
                        <span className="text-[11px] text-slate-500 truncate block">
                          {ev.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No evidence uploaded yet.</p>
          )}
        </div>

        {/* Upload Additional Evidence Form */}
        <form
          onSubmit={handleUploadEvidence}
          className="border-t border-slate-100 pt-4 space-y-3"
        >
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Upload Additional Evidence
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              className="rounded-xl border border-slate-200 p-2 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-hidden"
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
              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold hover:file:bg-slate-200"
            />
          </div>

          <input
            type="text"
            placeholder="Evidence note (e.g., Receipt screenshot)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium text-slate-800 focus:border-amber-500 focus:outline-hidden"
          />

          <button
            type="submit"
            disabled={isUploading || !file}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload Attachment
          </button>
        </form>
      </div>
    </div>
  );
};
"use client";

import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  Upload,
  Loader2,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import Swal from "sweetalert2";
import { createDispute, uploadDisputeEvidence } from "@/api/disputes.api";

// --- OPTIONS ---
const DISPUTE_REASONS = [
  { value: "DAMAGED", label: "Items Damaged Upon Delivery" },
  { value: "ITEM_MISSING", label: "Items Missing or Incomplete" },
  { value: "LOST_PACKAGE", label: "Lost Package" },
  { value: "DELAYED_DELIVERY", label: "Extreme Delay in Delivery" },
  { value: "NO_SHOW", label: "Traveler / Sender No Show" },
  { value: "OTHER", label: "Other Issue" },
];

const EVIDENCE_TYPES = [
  { value: "DAMAGE_PHOTO", label: "Damage Photo" },
  { value: "RECEIPT", label: "Receipt / Invoice" },
  { value: "CHAT_LOG", label: "Chat Log / Screenshot" },
  { value: "OTHER", label: "Other Document" },
];

interface OpenDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  packageTitle?: string;
  trackingNumber?: string;
  againstUserId: string;
  agreedAmount: number;
  onDisputeCreated: () => void;
}

export const OpenDisputeModal: React.FC<OpenDisputeModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  packageTitle = "MacBook Pro 16-inch",
  trackingNumber = "LL-2026-0LGA0MIX",
  againstUserId,
  agreedAmount,
  onDisputeCreated,
}) => {
  // Modal Step State: 1 = Form Details, 2 = Evidence Upload
  const [step, setStep] = useState<1 | 2>(1);

  // Form State - Step 1
  const [reason, setReason] = useState("DAMAGED");
  const [description, setDescription] = useState("");
  const [disputedAmount, setDisputedAmount] = useState<number>(agreedAmount);

  // Form State - Step 2
  const [createdDisputeId, setCreatedDisputeId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState("DAMAGE_PHOTO");
  const [evidenceDesc, setEvidenceDesc] = useState("");

  // Loading States
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  if (!isOpen) return null;

  // Helper function to extract Django/DRF error messages dynamically
  const parseBackendError = (err: any, fallbackMessage: string) => {
    if (!err?.response?.data) return fallbackMessage;

    const data = err.response.data;
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors[0];
    }
    if (Array.isArray(data.booking) && data.booking.length > 0) {
      return `Booking error: ${data.booking[0]}`;
    }

    // Process object field errors e.g. { reason: ["This field is required."] }
    if (typeof data === "object") {
      const firstKey = Object.keys(data)[0];
      if (firstKey && Array.isArray(data[firstKey]) && data[firstKey].length > 0) {
        return `${firstKey.toUpperCase()}: ${data[firstKey][0]}`;
      }
    }

    return fallbackMessage;
  };

  const handleResetAndClose = () => {
    setStep(1);
    setDescription("");
    setFile(null);
    setEvidenceDesc("");
    setCreatedDisputeId(null);
    onClose();
  };

  // ==============================================================================
  // STEP 1 HANDLER: POST /api/disputes/
  // ==============================================================================
  const handleStep1Continue = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double execution if already created or currently submitting
    if (isSubmittingDispute) return;
    if (createdDisputeId) {
      setStep(2);
      return;
    }

    if (!description.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Description",
        text: "Please explain what happened in the description field.",
        confirmButtonColor: "#e11d48",
      });
      return;
    }

    try {
      setIsSubmittingDispute(true);

      // Call API 1: Create Dispute
      const newDispute = await createDispute({
        booking: bookingId,
        booking_id: bookingId,
        against_user: againstUserId,
        reason: reason,
        description: description,
        disputed_amount: Number(disputedAmount),
      });

      // Flexible extraction supporting direct payload or nested dispute wrapper
      const disputeId =
        newDispute?.id ||
        newDispute?.dispute?.id ||
        (newDispute as any)?.data?.id ||
        (newDispute as any)?.data?.dispute?.id;

      if (!disputeId) {
        throw new Error("Failed to obtain dispute ID from response.");
      }

      // Immediately set dispute ID and transition to Step 2
      setCreatedDisputeId(disputeId);
      setStep(2);

      // Non-blocking toast alert
      Swal.fire({
        icon: "success",
        title: "Dispute Initialized!",
        text: "Your dispute case has been recorded. Next, please attach supporting evidence.",
        confirmButtonColor: "#0f172a",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error("Create Dispute Error:", err);
      const errorMessage = parseBackendError(
        err,
        "A dispute for this booking may already exist or invalid details were provided."
      );

      Swal.fire({
        icon: "error",
        title: "Failed to Open Dispute",
        text: errorMessage,
        confirmButtonColor: "#e11d48",
      });
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  // ==============================================================================
  // STEP 2 HANDLER: POST /api/disputes/{dispute_id}/evidence/
  // ==============================================================================
  const handleStep2SubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createdDisputeId) {
      Swal.fire({
        icon: "error",
        title: "Missing Dispute ID",
        text: "Dispute record missing. Please restart the process.",
        confirmButtonColor: "#e11d48",
      });
      return;
    }

    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please attach a photo or document before submitting, or click 'Skip for Now'.",
        confirmButtonColor: "#e11d48",
      });
      return;
    }

    try {
      setIsUploadingEvidence(true);

      // Call API 2: Upload Evidence using createdDisputeId
      await uploadDisputeEvidence(
        createdDisputeId,
        file,
        evidenceType,
        evidenceDesc.trim() || description
      );

      await Swal.fire({
        icon: "success",
        title: "Dispute Submitted!",
        text: "Your dispute claim and evidence attachments were successfully logged for review.",
        confirmButtonColor: "#0f172a",
      });

      onDisputeCreated();
      handleResetAndClose();
    } catch (err: any) {
      console.error("Upload Evidence Error:", err);
      const errorMessage = parseBackendError(
        err,
        "Failed to upload evidence attachment. Please try again."
      );

      Swal.fire({
        icon: "error",
        title: "Evidence Upload Failed",
        text: errorMessage,
        confirmButtonColor: "#e11d48",
      });
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  // Finish dispute creation without evidence attachment
  const handleSkipEvidence = async () => {
    await Swal.fire({
      icon: "success",
      title: "Dispute Case Created",
      text: "Your dispute has been logged without evidence. You can attach evidence files later if needed.",
      confirmButtonColor: "#0f172a",
    });

    onDisputeCreated();
    handleResetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Open Dispute</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Step {step} of 2
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================================================================== */}
        {/* STEP 1: DISPUTE DETAILS FORM                                       */}
        {/* ================================================================== */}
        {step === 1 && (
          <form onSubmit={handleStep1Continue} className="space-y-4 text-xs sm:text-sm">
            {/* Package Summary Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Package
              </span>
              <p className="font-extrabold text-slate-800 text-sm">
                {packageTitle}
              </p>
              <p className="font-mono text-xs text-slate-500 font-semibold">
                {trackingNumber}
              </p>
            </div>

            {/* Dispute Reason Dropdown */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 block">
                Dispute Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 font-semibold text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-hidden"
              >
                {DISPUTE_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 block">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened..."
                className="w-full rounded-xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-hidden resize-none"
              />
            </div>

            {/* Disputed Amount Input */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 block">
                Disputed Amount <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={disputedAmount}
                  onChange={(e) => setDisputedAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-14 py-2.5 font-bold text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-hidden"
                />
                <span className="absolute right-3.5 font-bold text-slate-400 text-xs">
                  USD
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingDispute}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {isSubmittingDispute ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================================================================== */}
        {/* STEP 2: EVIDENCE UPLOAD FORM                                       */}
        {/* ================================================================== */}
        {step === 2 && (
          <form onSubmit={handleStep2SubmitEvidence} className="space-y-4 text-xs sm:text-sm">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">
                Add Evidence
              </h3>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">
                Evidence helps our team investigate your dispute faster.
              </p>
            </div>

            {/* Upload Zone / File Picker */}
            {!file ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 hover:bg-rose-50/20 group">
                <Paperclip className="w-8 h-8 text-slate-400 group-hover:text-rose-500 mb-2 transition" />
                <span className="font-bold text-slate-700 group-hover:text-rose-600 transition">
                  Upload photos/documents
                </span>
                <span className="text-[11px] font-semibold text-slate-400 mt-1">
                  PNG, JPG, PDF • Max 10 MB
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            ) : (
              /* Selected File Card */
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 text-xs block">
                  Selected file
                </span>
                <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2.5 truncate">
                    {file.type.includes("image") ? (
                      <ImageIcon className="w-5 h-5 text-rose-500 shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="font-bold text-slate-800 truncate text-xs">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-semibold">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Evidence Type */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 block">
                Evidence Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-semibold text-slate-800 focus:border-rose-500 focus:outline-hidden"
              >
                {EVIDENCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Evidence Description */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-700 block">
                Description
              </label>
              <input
                type="text"
                value={evidenceDesc}
                onChange={(e) => setEvidenceDesc(e.target.value)}
                placeholder="e.g., Photo showing the cracked screen"
                className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-800 focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={handleSkipEvidence}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 transition cursor-pointer"
              >
                Skip for Now
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isUploadingEvidence}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-bold border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isUploadingEvidence || !file}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isUploadingEvidence ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Submit Dispute</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OpenDisputeModal;
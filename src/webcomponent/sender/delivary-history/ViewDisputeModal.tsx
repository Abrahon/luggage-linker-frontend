"use client";

import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  Upload,
  Loader2,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Swal from "sweetalert2";
import { uploadDisputeEvidence } from "@/api/disputes.api";

export interface EvidenceItem {
  id: string;
  file: string;
  evidence_type: string;
  description?: string;
  created_at?: string;
}

export interface DisputeData {
  id: string;
  booking: string;
  status: string;
  disputed_amount: number;
  reason: string;
  description: string;
  evidence?: EvidenceItem[];
  created_at?: string;
}

export interface ViewDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispute: DisputeData | null;
  onEvidenceUploaded: () => void;
}

const EVIDENCE_TYPES = [
  { value: "DAMAGE_PHOTO", label: "Damage Photo" },
  { value: "RECEIPT", label: "Receipt / Invoice" },
  { value: "CHAT_LOG", label: "Chat Log / Screenshot" },
  { value: "OTHER", label: "Other Document" },
];

export const ViewDisputeModal: React.FC<ViewDisputeModalProps> = ({
  isOpen,
  onClose,
  dispute,
  onEvidenceUploaded,
}) => {
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState("DAMAGE_PHOTO");
  const [evidenceDesc, setEvidenceDesc] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !dispute) return null;

  const handleUploadNewEvidence = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "Missing Attachment",
        text: "Please select a photo or document to attach.",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    try {
      setIsUploading(true);
      await uploadDisputeEvidence(
        dispute.id,
        file,
        evidenceType,
        evidenceDesc.trim() || dispute.description
      );

      // Success Alert
      await Swal.fire({
        icon: "success",
        title: "Evidence Attached!",
        text: "Your additional evidence file has been successfully uploaded to this dispute file.",
        confirmButtonColor: "#4f46e5",
        timer: 3000,
      });

      setFile(null);
      setEvidenceDesc("");
      setShowAddEvidence(false);
      onEvidenceUploaded();
    } catch (err: any) {
      console.error("Upload evidence error:", err);

      // Parse Backend DRF Error format cleanly
      let errorMessage = "Failed to upload evidence attachment. Please try again.";

      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMessage = data;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (typeof data === "object") {
          // Extracts field errors (e.g. { file: ["Invalid file format"] })
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            errorMessage = `${firstKey}: ${data[firstKey][0]}`;
          }
        }
      }

      // Error Alert
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
      });
      } finally {
            setIsUploading(false);
          }
  };

  // Helper for Status Badge
  const renderStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("RESOLVED") || s.includes("ACCEPTED") || s.includes("CLOSED")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    }
    if (s.includes("REJECTED") || s.includes("DISMISSED")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
        <Clock className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-slate-900 font-extrabold text-base">
                Dispute Details
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                ID: {dispute.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispute Summary Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
              Status
            </span>
            {renderStatusBadge(dispute.status)}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">
                Disputed Amount
              </span>
              <p className="font-extrabold text-slate-900 text-sm flex items-center gap-0.5 mt-0.5">
                <DollarSign className="w-4 h-4 text-slate-500" />
                {dispute.disputed_amount.toFixed(2)} USD
              </p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 block">
                Reason
              </span>
              <p className="font-bold text-slate-800 text-xs mt-0.5">
                {dispute.reason}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60">
            <span className="text-[11px] font-bold text-slate-400 block">
              Description
            </span>
            <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
              {dispute.description}
            </p>
          </div>
        </div>

        {/* Uploaded Evidence Files List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Evidence Attachments ({dispute.evidence?.length || 0})
            </h3>
            {!showAddEvidence && (
              <button
                type="button"
                onClick={() => setShowAddEvidence(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer flex items-center gap-1"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>+ Add More</span>
              </button>
            )}
          </div>

          {!dispute.evidence || dispute.evidence.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No evidence uploaded yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {dispute.evidence.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-slate-800 text-xs truncate">
                        {item.evidence_type}
                      </p>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {item.file && (
                    <a
                      href={item.file}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Optional Form to Add More Evidence */}
        {showAddEvidence && (
          <form
            onSubmit={handleUploadNewEvidence}
            className="border-t border-slate-100 pt-4 space-y-3"
          >
            <h4 className="text-xs font-extrabold text-slate-800">
              Attach Additional Evidence
            </h4>

            {!file ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 group">
                <Paperclip className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 mb-1 transition" />
                <span className="font-bold text-slate-700 text-xs">
                  Choose photo or document
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <ImageIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="font-bold text-slate-800 truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
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

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddEvidence(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !file}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Upload</span>
              </button>
            </div>
          </form>
        )}

        {/* Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDisputeModal;
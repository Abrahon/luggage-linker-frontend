"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search,
  Eye,
  ShieldAlert,
  X,
  Send,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Paperclip,
  Loader2,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";

import {
  getMyDisputes,
  getDisputeDetail,
  sendDisputeMessage,
  uploadDisputeEvidence,
  DisputeItem,
  DisputeStatus,
  DisputeMessage,
  PaginatedDisputesResponse,
} from "@/api/disputes.api";

// --- Date & URL Helpers ---
const formatDate = (dateString?: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return "N/A";
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) return "N/A";
  return parsedDate.toLocaleDateString("en-US", options || {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateString?: string): string => {
  if (!dateString) return "";
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) return "";
  return parsedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Safely extract and resolve absolute image URLs from evidence objects
const getEvidenceUrl = (ev: any): string => {
  if (!ev) return "";
  const rawUrl = ev.file_attachment || ev.file_url || ev.file || ev.attachment || "";
  if (!rawUrl) return "";
  
  // If backend returns relative path, construct absolute URL if standard origin is available
  if (typeof window !== "undefined" && rawUrl.startsWith("/")) {
    return `${window.location.origin}${rawUrl}`;
  }
  return rawUrl;
};

export default function SenderDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  const fetchDisputes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyDisputes();

      if (Array.isArray(data)) {
        setDisputes(data);
      } else if (data && Array.isArray((data as PaginatedDisputesResponse).results)) {
        setDisputes((data as PaginatedDisputesResponse).results);
      } else {
        setDisputes([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch disputes:", err);
      setError(err?.response?.data?.detail || "Failed to load disputes list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const getStatusBadge = (status: DisputeStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "UNDER_REVIEW":
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case "WAITING_FOR_USER":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "CLOSED":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const counts = useMemo(() => {
    return {
      ALL: disputes.length,
      OPEN: disputes.filter((d) => d.status === "OPEN").length,
      UNDER_REVIEW: disputes.filter((d) => d.status === "UNDER_REVIEW").length,
      WAITING_FOR_USER: disputes.filter((d) => d.status === "WAITING_FOR_USER").length,
      RESOLVED: disputes.filter((d) => d.status === "RESOLVED").length,
    };
  }, [disputes]);

  const filteredDisputes = useMemo(() => {
    return disputes.filter((item) => {
      if (activeTab !== "ALL" && item.status !== activeTab) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const tracking = item.booking?.tracking_number?.toLowerCase() || "";
        const reason = item.reason?.toLowerCase() || "";
        const against = item.against_user?.full_name?.toLowerCase() || "";
        return tracking.includes(q) || reason.includes(q) || against.includes(q);
      }
      return true;
    });
  }, [disputes, activeTab, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            Disputes Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track opened claims, review resolutions, and communicate with administration.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tracking, reason, user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="flex items-center gap-1 sm:gap-2 px-4 pt-3 border-b border-slate-200/80 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[
            { key: "ALL", label: `All (${counts.ALL})` },
            { key: "OPEN", label: `Open (${counts.OPEN})` },
            { key: "UNDER_REVIEW", label: `Under Review (${counts.UNDER_REVIEW})` },
            { key: "WAITING_FOR_USER", label: `Waiting (${counts.WAITING_FOR_USER})` },
            { key: "RESOLVED", label: `Resolved (${counts.RESOLVED})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600 bg-indigo-50/40"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading disputes...</p>
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="py-20 text-center">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No disputes found</h3>
            <p className="text-xs text-slate-400 mt-1">There are no claims matching your filter.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Tracking No.</th>
                  <th className="px-5 py-3.5">Against</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDisputes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900">
                      {item.tracking_number || item.booking?.tracking_number || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.against_user?.full_name || "N/A"}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                        {item.reason_display || item.reason?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      ${parseFloat(item.disputed_amount || "0").toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status_display || item.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedDisputeId(item.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/70 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedDisputeId && (
        <DisputeDetailsModal
          disputeId={selectedDisputeId}
          onClose={() => setSelectedDisputeId(null)}
        />
      )}
    </div>
  );
}

// ==============================================================================
// MODAL COMPONENT (REAL-TIME EVIDENCE PREVIEW & FULL TIMELINE)
// ==============================================================================

interface DisputeDetailsModalProps {
  disputeId: string;
  onClose: () => void;
}

function DisputeDetailsModal({ disputeId, onClose }: DisputeDetailsModalProps) {
  const [dispute, setDispute] = useState<DisputeItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchDetail = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setErrorMsg(null);
      const data = await getDisputeDetail(disputeId);
      setDispute(data);

      if (data?.reason && !selectedType) {
        setSelectedType(data.reason);
      }
    } catch (err: any) {
      console.error("Failed to load dispute details:", err);
      if (!isSilent) setErrorMsg("Failed to load dispute details.");
    } {
      if (!isSilent) setLoading(false);
    }
  }, [disputeId, selectedType]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    scrollToBottom();
  }, [dispute?.messages]);

  // --- AUTOMATIC TYPE EVIDENCE UPLOAD HANDLER ---
  const handleUploadEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !dispute) return;

    const finalType = selectedType || dispute.reason || "DAMAGE_PHOTO";

    try {
      setUploading(true);
      const newEv = await uploadDisputeEvidence(
        dispute.id,
        file,
        finalType,
        `Evidence uploaded for ${finalType}`
      );

      // Normalize evidence object so image source renders immediately
      const fileUrl = getEvidenceUrl(newEv) || URL.createObjectURL(file);
      const normalizedEv = {
        ...newEv,
        file_attachment: fileUrl,
        file_url: fileUrl,
        id: newEv?.id || `temp-${Date.now()}`,
      };

      // Optimistically add to UI state
      setDispute((prev) =>
        prev
          ? {
              ...prev,
              evidence: [...(prev.evidence || []), normalizedEv],
            }
          : prev
      );

      if (!selectedType) {
        setSelectedType(finalType);
      }

      // Sync with server state in background to fetch updated backend URLs
      fetchDetail(true);
    } catch (err: any) {
      console.error("Evidence upload error:", err);
      alert(err?.response?.data?.detail || "Failed to upload evidence.");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !dispute) return;

    try {
      setSendingMsg(true);
      const createdMessage = await sendDisputeMessage(dispute.id, messageText.trim());

      setDispute((prev) =>
        prev
          ? {
              ...prev,
              messages: [
                ...(prev.messages || []),
                {
                  ...createdMessage,
                  created_at: createdMessage.created_at || new Date().toISOString(),
                  is_mine: true,
                },
              ],
            }
          : prev
      );

      setMessageText("");
    } catch (err: any) {
      console.error("Error posting message:", err);
      alert(err?.response?.data?.detail || "Failed to send message.");
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Dispute Details</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {dispute?.booking?.tracking_number || disputeId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Fetching details...</p>
          </div>
        ) : errorMsg || !dispute ? (
          <div className="p-6 text-center text-rose-600 text-xs">{errorMsg || "Dispute not found."}</div>
        ) : (
          <>
            {/* Reason & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {dispute.reason_display || dispute.reason?.replace(/_/g, " ")}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{dispute.description}"
                </p>
                <div className="pt-2 text-xs">
                  <span className="text-slate-400">Disputed amount: </span>
                  <span className="font-bold text-slate-900">
                    -${parseFloat(dispute.disputed_amount || "0").toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    STATUS
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{dispute.status_display || dispute.status?.replace(/_/g, " ")}</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-mono">
                  {formatDate(dispute.created_at)}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Booking
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs border-b border-slate-200/60 pb-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tracking</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {dispute.booking?.tracking_number}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status</span>
                  <span className="font-semibold text-slate-800">
                    {dispute.booking?.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment</span>
                  <span className="font-semibold text-slate-800">
                    {dispute.booking?.payment_status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="flex items-center gap-2">
                  {dispute.opened_by?.profile_picture ? (
                    <img
                      src={dispute.opened_by.profile_picture}
                      alt="Sender"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4 text-slate-400" />
                  )}
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sender</span>
                    <span className="font-semibold text-slate-800">
                      {dispute.opened_by?.full_name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {dispute.against_user?.profile_picture ? (
                    <img
                      src={dispute.against_user.profile_picture}
                      alt="Traveler"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4 text-slate-400" />
                  )}
                  <div>
                    <span className="text-slate-400 block text-[10px]">Traveler</span>
                    <span className="font-semibold text-slate-800">
                      {dispute.against_user?.full_name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Card & Settlement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" /> Evidence
                    </h4>
                    {selectedType && (
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {selectedType.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  {dispute.permissions?.can_upload_evidence !== false && (
                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 cursor-pointer"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3" /> + Add Image
                          </>
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUploadEvidence}
                        disabled={uploading}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                {!dispute.evidence || dispute.evidence.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No evidence uploaded yet.</p>
                ) : (
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {dispute.evidence.map((ev, index) => {
                      const imgUrl = getEvidenceUrl(ev);
                      return (
                        <a
                          key={ev.id || index}
                          href={imgUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity shrink-0 bg-slate-100 flex items-center justify-center"
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={ev.description || "Evidence"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Settlement
                </h4>
                {dispute.settlement ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total</span>
                      <span className="font-bold text-slate-900">
                        ${parseFloat(dispute.settlement.total_amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Refund</span>
                      <span className="font-bold text-emerald-600">
                        ${parseFloat(dispute.settlement.sender_refund).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Payout</span>
                      <span className="font-bold text-slate-900">
                        ${parseFloat(dispute.settlement.traveler_payout).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">Pending settlement resolution.</p>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Messages
              </h4>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 max-h-60 overflow-y-auto space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {!dispute.messages || dispute.messages.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No messages in this thread yet.</p>
                ) : (
                  dispute.messages.map((msg) => {
                    const isMine =
                      msg.is_mine === true ||
                      msg.sender === dispute.opened_by?.id ||
                      msg.sender_email === dispute.opened_by?.email;

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {msg.sender_profile_picture ? (
                          <img
                            src={msg.sender_profile_picture}
                            alt="Avatar"
                            className="w-7 h-7 rounded-full object-cover shrink-0 mt-1"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0 text-[10px] font-bold mt-1">
                            {msg.sender_name?.[0] || (isMine ? "Y" : "U")}
                          </div>
                        )}

                        <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-slate-700">
                              {isMine ? "You" : msg.sender_name || "Admin / User"}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <div
                            className={`px-3.5 py-2.5 rounded-2xl text-xs max-w-[85%] ${
                              isMine
                                ? "bg-indigo-600 text-white rounded-tr-none"
                                : msg.is_admin_note
                                ? "bg-amber-100 text-amber-900 border border-amber-200/80 rounded-tl-none font-medium"
                                : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs"
                            }`}
                          >
                            {msg.message_text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box with direct image upload shortcut */}
              {dispute.permissions?.can_send_message !== false && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Write a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      disabled={sendingMsg}
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 focus:bg-white"
                    />
                    <label className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <Paperclip className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadEvidence}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={sendingMsg || !messageText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    {sendingMsg ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Send
                  </button>
                </div>
              )}
            </div>

            {/* Case Timeline */}
            {dispute.history && dispute.history.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Case Timeline
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  {dispute.history.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">
                          {item.action || item.description || item.status || "Status Updated"}
                        </p>
                        {item.created_at && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(item.created_at)} {formatTime(item.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Paperclip,
  Loader2,
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  PlusCircle,
  ExternalLink,
  Package,
  User,
  Hash,
  Mail,
} from "lucide-react";
import {
  DisputeItem,
  DisputeMessage,
  DisputeEvidence,
  sendDisputeMessage,
  uploadDisputeEvidence,
} from "@/api/disputes.api";

interface TravelerDisputeModalProps {
  dispute: DisputeItem | null;
  onClose: () => void;
  onRefresh: () => void;
}

export const TravelerDisputeModal: React.FC<TravelerDisputeModalProps> = ({
  dispute,
  onClose,
  onRefresh,
}) => {
  // Local state
  const [messagesList, setMessagesList] = useState<DisputeMessage[]>([]);
  const [evidenceList, setEvidenceList] = useState<DisputeEvidence[]>([]);

  // Message form state
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Evidence form state
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [evidenceType, setEvidenceType] = useState<string>("DAMAGE_PHOTO");
  const [evidenceDesc, setEvidenceDesc] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Active traveler email to position chat bubbles properly
  const travelerEmail = dispute?.against_user?.email || "";

  // Extract nested booking information safely
  const bookingObj =
    typeof dispute?.booking === "object" ? dispute.booking : null;
  const trackingNumber =
    bookingObj?.tracking_number || (typeof dispute?.booking === "string" ? dispute.booking : "N/A");
  const packageDetails =
    bookingObj?.package_details || bookingObj?.package_name || "Shipment Item";

  // Extract sender details
  const senderName =
    dispute?.opened_by?.full_name || "Sender";
  const senderEmail =
    dispute?.opened_by?.email || "N/A";
  const senderAvatar =
    dispute?.opened_by?.profile_picture;

  useEffect(() => {
    if (dispute) {
      setMessagesList(dispute.messages || []);
      setEvidenceList(dispute.evidence || []);
    }
  }, [dispute]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList]);

  if (!dispute) return null;

  // Handler: Reply to Dispute Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      const newMessage = await sendDisputeMessage(dispute.id, messageText);
      setMessagesList((prev) => [...prev, newMessage]);
      setMessageText("");
      onRefresh();
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  // Handler: Upload Verification Evidence
  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !evidenceDesc.trim() || isUploading) return;

    setIsUploading(true);
    try {
      const newEvidence = await uploadDisputeEvidence(
        dispute.id,
        file,
        evidenceType,
        evidenceDesc
      );

      setEvidenceList((prev) => [...prev, newEvidence]);
      setFile(null);
      setEvidenceDesc("");
      setShowEvidenceForm(false);
      onRefresh();
    } catch (error) {
      console.error("Failed to upload evidence:", error);
      alert("Failed to upload evidence file.");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string, display?: string) => {
    const styles: Record<string, string> = {
      OPEN: "bg-red-50 text-red-700 border-red-200",
      UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
      WAITING_FOR_USER: "bg-blue-50 text-blue-700 border-blue-200",
      RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      REJECTED: "bg-gray-100 text-gray-700 border-gray-300",
      CLOSED: "bg-gray-50 text-gray-600 border-gray-200",
    };
    return (
      <span
        className={`px-2.5 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1 ${
          styles[status] || "bg-gray-50 text-gray-700 border-gray-200"
        }`}
      >
        ● {display || status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold">Dispute Case #{dispute.id.slice(0, 8)}</h2>
              <p className="text-xs text-slate-400">
                Created on {new Date(dispute.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 🌟 NEW: Sender & Package Details Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 divide-y divide-slate-200/60 text-xs">
            {/* Sender Info Row */}
            <div className="pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {senderAvatar ? (
                  <img
                    src={senderAvatar}
                    alt={senderName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Opened By (Sender)
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{senderName}</h3>
                  <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {senderEmail}
                  </p>
                </div>
              </div>
              <div>
                {getStatusBadge(dispute.status, dispute.status_display)}
              </div>
            </div>

            {/* Booking & Package Info Row */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-slate-400" /> Package
                </span>
                <span className="font-semibold text-slate-800 truncate block">
                  {packageDetails}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-0.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-slate-400" /> Tracking
                </span>
                <span className="font-mono font-medium text-slate-700 truncate block">
                  {trackingNumber}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Dispute Reason</span>
                <span className="font-medium text-slate-800 block">
                  {dispute.reason_display || dispute.reason}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Disputed Amount</span>
                <span className="font-bold text-emerald-600 block">
                  ${Number(dispute.disputed_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Claim Description
            </h4>
            <p className="p-4 bg-slate-50 text-gray-700 text-sm rounded-xl border border-slate-200/60 leading-relaxed">
              {dispute.description || "No description provided."}
            </p>
          </div>

          {/* Evidence Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Submitted Evidence ({evidenceList.length})
              </h4>
              <button
                onClick={() => setShowEvidenceForm(!showEvidenceForm)}
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {showEvidenceForm ? "Cancel" : "Upload Response Evidence"}
              </button>
            </div>

            {/* Evidence Form */}
            {showEvidenceForm && (
              <form
                onSubmit={handleUploadEvidence}
                className="p-4 mb-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Evidence Type
                    </label>
                    <select
                      value={evidenceType}
                      onChange={(e) => setEvidenceType(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="DAMAGE_PHOTO">Delivery/Damage Photo</option>
                      <option value="RECEIPT">Receipt / Invoice</option>
                      <option value="CHAT_LOG">Chat Log Screenshot</option>
                      <option value="IMAGE">Image</option>
                      <option value="OTHER">Other Proof</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Select File
                    </label>
                    <input
                      type="file"
                      required
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
                    />
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Provide context for this evidence..."
                    value={evidenceDesc}
                    onChange={(e) => setEvidenceDesc(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUploading || !file}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Paperclip className="w-3.5 h-3.5" />
                  )}
                  Upload Attachment
                </button>
              </form>
            )}

            {/* Evidence List */}
            {evidenceList.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No evidence uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evidenceList.map((item) => (
                  <a
                    key={item.id}
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 transition group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
                        {item.evidence_type === "DAMAGE_PHOTO" || item.evidence_type === "IMAGE" ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-gray-800 truncate">
                          {item.evidence_type_display || item.evidence_type}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">{item.description}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600 flex-shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Conversation Window */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Case Discussion & Replies
            </h4>

            <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 min-h-[200px] max-h-[280px] overflow-y-auto space-y-3">
              {messagesList.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No messages recorded in this case yet.
                </div>
              ) : (
                messagesList.map((msg) => {
                  const isMe = msg.sender_email === travelerEmail;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[10px] text-gray-400 mb-1 px-1">
                        {msg.sender_email} •{" "}
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div
                        className={`max-w-[80%] p-3 text-sm rounded-2xl ${
                          isMe
                            ? "bg-emerald-600 text-white rounded-br-none"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-xs"
                        }`}
                      >
                        {msg.message_text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Response Input */}
            <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your reply or explanation..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isSending || !messageText.trim()}
                className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
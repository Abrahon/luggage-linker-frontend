"use client";

import React, { useEffect, useState } from "react";
import {
  DisputeDetailItem,
  DisputeStatusType,
  ResolutionType,
  assignDisputeToMe,
  getAdminDisputeById,
  requestDisputeEvidence,
  resolveDispute,
  updateDisputeStatus,
} from "@/api/adminDisputes.api";
import {
  X,
  Loader2,
  Paperclip,
  Send,
  Plus,
  Image as ImageIcon,
  FileText,
  AlertCircle,
} from "lucide-react";

interface Props {
  disputeId: string | null;
  onClose: () => void;
  onRefreshList: () => void;
}

export const DisputeDetailModal: React.FC<Props> = ({
  disputeId,
  onClose,
  onRefreshList,
}) => {
  const [dispute, setDispute] = useState<DisputeDetailItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Form Controls State
  const [status, setStatus] = useState<DisputeStatusType>("OPEN");
  const [resolution, setResolution] = useState<ResolutionType | "NONE">("NONE");
  const [refundRatio, setRefundRatio] = useState<number>(50);
  const [adminNotes, setAdminNotes] = useState<string>("");

  // Chat & Evidence State
  const [newMessage, setNewMessage] = useState<string>("");
  const [showRequestEvidence, setShowRequestEvidence] = useState<boolean>(false);
  const [evidenceRequestMsg, setEvidenceRequestMsg] = useState<string>("");
  const [sendingEvidence, setSendingEvidence] = useState<boolean>(false);

  // Fetch Dispute Details
  const fetchDetail = async () => {
    if (!disputeId) return;
    setLoading(true);
    try {
      const data = await getAdminDisputeById(disputeId);
      setDispute(data);
      setStatus(data.status);

      if (data.resolution) {
        setResolution(data.resolution);
      } else {
        setResolution("NONE");
      }

      if (data.admin_notes) setAdminNotes(data.admin_notes);

      if (data.settlement?.refund_ratio) {
        setRefundRatio(Math.round(parseFloat(data.settlement.refund_ratio) * 100));
      }
    } catch (err) {
      console.error("Failed to fetch dispute details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [disputeId]);

  if (!disputeId) return null;

  // Dynamic Settlement Preview Calculations
  const escrowAmount = parseFloat(dispute?.disputed_amount || "0");
  const senderRefund = (escrowAmount * (refundRatio / 100)).toFixed(2);
  const travelerPayout = (escrowAmount * ((100 - refundRatio) / 100)).toFixed(2);

  // 1. Assign to Me Action
  const handleAssignToMe = async () => {
    setActionLoading(true);
    try {
      await assignDisputeToMe(disputeId);
      await fetchDetail();
      onRefreshList();
    } catch (err) {
      alert("Failed to assign dispute.");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Resolve Dispute Action
  const handleResolveDispute = async () => {
    if (resolution === "NONE") {
      alert("Please select a valid resolution type.");
      return;
    }

    let ratio = 0;

    if (resolution === "FULL_REFUND") {
      ratio = 1.00;
    } else if (resolution === "PARTIAL_REFUND") {
      ratio = refundRatio / 100;

      if (ratio < 0.01 || ratio > 0.99) {
        alert("Partial refund must be between 1% and 99%.");
        return;
      }
    } else if (
      resolution === "RELEASE_PAYMENT" ||
      resolution === "NO_ACTION"
    ) {
      ratio = 0.00;
    }

    setActionLoading(true);

    try {
      await resolveDispute(disputeId, {
        resolution_type: resolution,
        admin_notes: adminNotes,
        refund_ratio: ratio,
      });

      await fetchDetail();
      onRefreshList();
      onClose();
    } catch (err: any) {
      console.error("Resolve dispute error:", err);

      const message =
        err?.response?.data?.errors?.refund_ratio?.[0] ||
        err?.response?.data?.message ||
        "Failed to resolve dispute.";

      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Reject Dispute Action
  const handleRejectDispute = async () => {
    setActionLoading(true);
    try {
      await resolveDispute(disputeId, {
        resolution_type: "NO_ACTION",
        admin_notes: adminNotes || "Dispute claim rejected by admin.",
        refund_ratio: 0.00,
      });
      await fetchDetail();
      onRefreshList();
      onClose();
    } catch (err: any) {
      console.error("Reject dispute error:", err);

      const message =
        err?.response?.data?.errors?.refund_ratio?.[0] ||
        err?.response?.data?.message ||
        "Failed to reject dispute.";

      alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Save Draft / Status Override
  const handleSaveDraft = async () => {
    setActionLoading(true);
    try {
      await updateDisputeStatus(disputeId, status);
      await fetchDetail();
      onRefreshList();
      alert("Dispute status updated successfully.");
    } catch (err) {
      alert("Failed to save draft status.");
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Send Request Evidence
  const handleSendEvidenceRequest = async () => {
    if (!evidenceRequestMsg.trim()) return;
    setSendingEvidence(true);
    try {
      await requestDisputeEvidence(disputeId, {
        request_message: evidenceRequestMsg,
      });
      setEvidenceRequestMsg("");
      setShowRequestEvidence(false);
      await fetchDetail();
    } catch (err) {
      alert("Failed to send evidence request.");
    } finally {
      setSendingEvidence(false);
    }
  };

  // Dynamic Resolution Dropdown Handler
  const handleResolutionChange = (val: string) => {
    const selected = val as ResolutionType | "NONE";

    setResolution(selected);

    switch (selected) {
      case "FULL_REFUND":
        setRefundRatio(100);
        break;

      case "PARTIAL_REFUND":
        setRefundRatio(50);
        break;

      case "RELEASE_PAYMENT":
      case "NO_ACTION":
        setRefundRatio(0);
        break;

      default:
        setRefundRatio(0);
    }
  };

  // Formatting date helper
  const createdDate = dispute?.created_at || dispute?.timeline?.opened_at;
  const formattedDate = createdDate
    ? new Date(createdDate).toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const trackingNo =
    typeof dispute?.booking === "object" && dispute?.booking?.tracking_number
      ? dispute.booking.tracking_number
      : "N/A";

  const packageName =
    typeof dispute?.booking === "object" && dispute?.booking?.package_details
      ? dispute.booking.package_details
      : "Unspecified Package";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-300">
        {/* Header Bar */}
        <div className="bg-gray-900 text-white px-5 py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-bold tracking-wide text-emerald-400">
                #{trackingNo}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-extrabold tracking-wider rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                [{dispute?.status_display || dispute?.status || status}]
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-800">
            <span className="font-medium text-gray-200">{packageName}</span>
            <span className="font-bold text-emerald-400">
              ${dispute?.disputed_amount || "0.00"} USD
            </span>
          </div>
        </div>

        {loading || !dispute ? (
          <div className="flex-1 flex items-center justify-center p-12 text-gray-500 text-sm">
            <Loader2 className="animate-spin mr-2 text-emerald-600" size={24} />
            Loading dispute details...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50">
            {/* Booking Information Section */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b">
                Booking Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-gray-500 block">Tracking Number</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {trackingNo}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Package</span>
                  <span className="font-semibold text-gray-900">{packageName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Sender</span>
                  <span className="font-medium text-gray-800">
                    {dispute.opened_by?.full_name || dispute.opened_by?.email || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Traveler</span>
                  <span className="font-medium text-gray-800">
                    {dispute.against_user?.full_name || dispute.against_user?.email || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Opened At</span>
                  <span className="font-medium text-gray-800">{formattedDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Disputed Amount</span>
                  <span className="font-bold text-emerald-600">
                    ${dispute.disputed_amount}
                  </span>
                </div>
              </div>
            </div>

            {/* Reason Section */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b">
                Reason
              </h3>
              <h4 className="text-sm font-bold text-gray-900">
                {dispute.reason_display || dispute.reason || "N/A"}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                {dispute.description || "No description provided."}
              </p>
            </div>

            {/* Settlement Preview Section */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b">
                Settlement Preview
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-100">
                <div>
                  <span className="text-gray-500 block">Escrow Amount</span>
                  <span className="font-bold text-gray-900 text-sm">
                    ${escrowAmount.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Refund Ratio</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {refundRatio}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Sender Refund</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    ${senderRefund}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Traveler Payout</span>
                  <span className="font-bold text-blue-600 text-sm">
                    ${travelerPayout}
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Section */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-1 border-b">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Evidence
                </h3>
                <button
                  onClick={() => setShowRequestEvidence(!showRequestEvidence)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus size={13} /> Request More Evidence
                </button>
              </div>

              {/* Request Evidence Box */}
              {showRequestEvidence && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
                  <textarea
                    rows={2}
                    value={evidenceRequestMsg}
                    onChange={(e) => setEvidenceRequestMsg(e.target.value)}
                    placeholder="Specify the additional documents or photos required from the user..."
                    className="w-full text-xs p-2.5 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowRequestEvidence(false)}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendEvidenceRequest}
                      disabled={sendingEvidence || !evidenceRequestMsg.trim()}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-md shadow-sm disabled:opacity-50 flex items-center gap-1"
                    >
                      {sendingEvidence && <Loader2 size={12} className="animate-spin" />}
                      Send Request
                    </button>
                  </div>
                </div>
              )}

              {/* Evidence List */}
              {dispute.evidence && dispute.evidence.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {dispute.evidence.map((item, idx) => (
                    <a
                      key={item.id || idx}
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-emerald-500 transition-colors text-xs text-gray-700 truncate group"
                    >
                      {item.file_url.endsWith(".pdf") ? (
                        <FileText size={16} className="text-red-500 shrink-0" />
                      ) : (
                        <ImageIcon size={16} className="text-blue-500 shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="block truncate font-medium group-hover:text-emerald-700">
                          {item.description || `Attachment ${idx + 1}`}
                        </span>
                        <span className="text-[10px] text-gray-400 block uppercase">
                          {item.evidence_type_display || item.evidence_type}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                  <AlertCircle size={14} /> No evidence uploaded for this dispute yet.
                </div>
              )}
            </div>

            {/* Conversation Section */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b">
                Conversation
              </h3>

              {/* Messages Thread */}
              <div className="space-y-3 max-h-56 overflow-y-auto p-3 bg-gray-50/70 rounded-lg border border-gray-100 text-xs">
                {dispute.messages && dispute.messages.length > 0 ? (
                  dispute.messages.map((msg) => (
                    <div key={msg.id} className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold text-gray-800">
                          {msg.sender_name || msg.sender_email || "User"}
                        </span>
                        <span className="text-gray-400">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="bg-white p-2.5 rounded-lg border border-gray-200 text-gray-700 shadow-2xs">
                        {msg.message_text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-gray-400">
                    No communication history available.
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="space-y-2 pt-1">
                <textarea
                  rows={2}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type message..."
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-gray-800"
                />
                <div className="flex justify-between items-center">
                  <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                    <Paperclip size={14} /> Attach File
                  </button>
                  <button
                    onClick={() => setNewMessage("")}
                    disabled={!newMessage.trim()}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Send size={12} /> Send Message
                  </button>
                </div>
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Internal Admin Notes
                </h3>
                <span className="text-[11px] text-gray-400 italic">
                  (Not visible to users)
                </span>
              </div>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Write internal notes or inspection remarks..."
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-gray-800"
              />
            </div>

            {/* Admin Controls Grid */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Assign Button */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500">
                    Assignee
                  </label>
                  <button
                    onClick={handleAssignToMe}
                    disabled={actionLoading}
                    className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg border border-gray-300 transition-colors truncate"
                  >
                    {dispute.assigned_admin
                      ? dispute.assigned_admin.full_name || dispute.assigned_admin.email
                      : "Assign to Me"}
                  </button>
                </div>

                {/* Status Dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DisputeStatusType)}
                    className="w-full py-2 px-2.5 border border-gray-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900"
                  >
                    <option value="OPEN">Open</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="WAITING_FOR_USER">Waiting User</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                {/* Resolution Dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500">
                    Resolution
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => handleResolutionChange(e.target.value)}
                    className="w-full py-2 px-2.5 border border-gray-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-900"
                  >
                    <option value="NONE">None</option>
                    <option value="FULL_REFUND">Full Refund to Sender</option>
                    <option value="PARTIAL_REFUND">Partial Refund</option>
                    <option value="RELEASE_PAYMENT">Release Escrow to Traveler</option>
                    <option value="NO_ACTION">No Action</option>
                  </select>
                </div>

                {/* Refund Ratio Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500">
                    Refund Ratio
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      disabled={resolution !== "PARTIAL_REFUND"}
                      min="1"
                      max="99"
                      value={refundRatio}
                      onChange={(e) => setRefundRatio(Number(e.target.value))}
                      className={`w-full py-2 pr-7 pl-3 border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                        resolution !== "PARTIAL_REFUND"
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white"
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={handleRejectDispute}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={handleSaveDraft}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg border border-gray-300 transition-colors disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleResolveDispute}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading && <Loader2 size={13} className="animate-spin" />}
                  Resolve Dispute
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
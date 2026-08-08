"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Eye,
  ShieldAlert,
  X,
  Send,
  Upload,
  Image as ImageIcon,
  MessageSquare,
  DollarSign,
  AlertCircle,
  FileText,
  User,
  Clock,
  CheckCircle2,
} from "lucide-react";

// --- Types ---
export type DisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "WAITING_FOR_USER"
  | "RESOLVED"
  | "REJECTED"
  | "CLOSED";

export interface DisputeMessage {
  id: string;
  sender: "Admin" | "You" | "Traveler";
  message: string;
  timestamp: string;
}

export interface DisputeItem {
  id: string; // Dispute ID
  booking_id: string;
  tracking_number: string;
  package_title: string;
  against_user: string;
  reason: string;
  description: string;
  disputed_amount: number;
  currency: string;
  status: DisputeStatus;
  created_at: string;
  evidence: string[]; // URLs or file names
  conversation: DisputeMessage[];
}

// --- Dummy Mock Data ---
const MOCK_DISPUTES: DisputeItem[] = [
  {
    id: "3d8207d5-3be5-4963-82a5-ed1f84c499ee",
    booking_id: "df612b9b-179a-4a99-8c2f-7cd031673afa",
    tracking_number: "LL-2026-0LGA0MIX",
    package_title: "MacBook Pro 16-inch",
    against_user: "Sujon Traveler",
    reason: "Damaged",
    description:
      "The traveler delivered my MacBook with a cracked display corner and severe scratches on the outer shell casing.",
    disputed_amount: 80.0,
    currency: "USD",
    status: "OPEN",
    created_at: "Aug 07, 2026",
    evidence: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60",
    ],
    conversation: [
      {
        id: "m1",
        sender: "Admin",
        message: "Dispute opened. Please provide clear photographic evidence of the physical damage.",
        timestamp: "Aug 07, 10:15 AM",
      },
      {
        id: "m2",
        sender: "You",
        message: "I have uploaded the photo showing the top lid crack.",
        timestamp: "Aug 07, 10:42 AM",
      },
    ],
  },
  {
    id: "4e9318e6-4cf6-5a0a-93b6-fe2g95d500ff",
    booking_id: "e0723a1c-280b-5b00-9d3g-8de142784b0b",
    tracking_number: "LL-2026-4L4WC3QK",
    package_title: "Legal Documents",
    against_user: "Alex Rivera",
    reason: "Missing Item",
    description: "One sealed notary envelope was missing upon arrival.",
    disputed_amount: 25.0,
    currency: "USD",
    status: "UNDER_REVIEW",
    created_at: "Aug 06, 2026",
    evidence: [],
    conversation: [
      {
        id: "m10",
        sender: "Admin",
        message: "We are reviewing the dispatch log with the courier service.",
        timestamp: "Aug 06, 02:30 PM",
      },
    ],
  },
  {
    id: "5f0429f7-5dg7-6b1b-04e7-gf3h06e611aa",
    booking_id: "f1834b2d-391c-6c11-0ee8-he4i13895c1c",
    tracking_number: "LL-2026-X7P8K2LQ",
    package_title: "iPhone 15",
    against_user: "Marcus Vance",
    reason: "Lost Package",
    description: "Item was never delivered past the agreed schedule.",
    disputed_amount: 120.0,
    currency: "USD",
    status: "RESOLVED",
    created_at: "Aug 02, 2026",
    evidence: [],
    conversation: [
      {
        id: "m20",
        sender: "Admin",
        message: "Dispute resolved in favor of the sender. Escrow refunded.",
        timestamp: "Aug 03, 09:00 AM",
      },
    ],
  },
];

export default function SenderDisputesPage() {
  // --- States ---
  const [disputes, setDisputes] = useState<DisputeItem[]>(MOCK_DISPUTES);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);

  // --- Badge Styling Helper ---
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

  // --- Tab Counts & Filtering ---
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
      // Tab filter
      if (activeTab !== "ALL" && item.status !== activeTab) return false;

      // Search filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchTracking = item.tracking_number.toLowerCase().includes(query);
        const matchPackage = item.package_title.toLowerCase().includes(query);
        const matchReason = item.reason.toLowerCase().includes(query);
        const matchTraveler = item.against_user.toLowerCase().includes(query);
        return matchTracking || matchPackage || matchReason || matchTraveler;
      }
      return true;
    });
  }, [disputes, activeTab, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 text-slate-900 p-4 sm:p-6 lg:p-8 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      
      {/* Header & Title */}
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

        {/* Global Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search disputes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
          />
        </div>
      </div>

      {/* --- Main Card --- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        
        {/* --- Tabs Header --- */}
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

        {/* --- Disputes 8-Column Table --- */}
        <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filteredDisputes.length === 0 ? (
            <div className="py-20 text-center">
              <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800">No disputes found</h3>
              <p className="text-xs text-slate-400 mt-1">
                There are no open claims matching your active filter.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Tracking No.</th>
                  <th className="px-5 py-3.5">Package</th>
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
                    {/* 1. Tracking No */}
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900">
                      {item.tracking_number}
                    </td>

                    {/* 2. Package */}
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {item.package_title}
                    </td>

                    {/* 3. Against */}
                    <td className="px-5 py-4 text-slate-600">
                      {item.against_user}
                    </td>

                    {/* 4. Reason */}
                    <td className="px-5 py-4 text-slate-700">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                        {item.reason}
                      </span>
                    </td>

                    {/* 5. Amount */}
                    <td className="px-5 py-4 font-bold text-slate-900">
                      ${item.disputed_amount.toFixed(2)}
                    </td>

                    {/* 6. Status Badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* 7. Created Date */}
                    <td className="px-5 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {item.created_at}
                    </td>

                    {/* 8. Action Button */}
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedDispute(item)}
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
          )}
        </div>
      </div>

      {/* --- DISPUTE DETAILS MODAL --- */}
      {selectedDispute && (
        <DisputeDetailsModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onUpdateDispute={(updated) => {
            setDisputes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
            setSelectedDispute(updated);
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// --- DISPUTE DETAILS MODAL COMPONENT ---
// ==========================================

interface DisputeDetailsModalProps {
  dispute: DisputeItem;
  onClose: () => void;
  onUpdateDispute: (updated: DisputeItem) => void;
}

function DisputeDetailsModal({ dispute, onClose, onUpdateDispute }: DisputeDetailsModalProps) {
  const [newMessage, setNewMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // Send message handler
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: DisputeMessage = {
      id: `msg-${Date.now()}`,
      sender: "You",
      message: newMessage.trim(),
      timestamp: "Just now",
    };

    const updated = {
      ...dispute,
      conversation: [...dispute.conversation, msg],
    };

    onUpdateDispute(updated);
    setNewMessage("");
  };

  // Upload evidence handler
  const handleUploadEvidence = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file);
      const updated = {
        ...dispute,
        evidence: [...dispute.evidence, fakeUrl],
      };
      onUpdateDispute(updated);
      setUploading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Dispute Details</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{dispute.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispute Summary Card */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {dispute.package_title}
              </h4>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Tracking: {dispute.tracking_number}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
              {dispute.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 text-slate-600">
            <div>
              <span className="text-slate-400">Reason:</span>{" "}
              <span className="font-semibold text-slate-800">{dispute.reason}</span>
            </div>
            <div>
              <span className="text-slate-400">Disputed Amount:</span>{" "}
              <span className="font-extrabold text-indigo-600">${dispute.disputed_amount.toFixed(2)} {dispute.currency}</span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Description
          </h4>
          <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
            {dispute.description}
          </p>
        </div>

        {/* Evidence Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Evidence Uploaded
            </h4>
            <label className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
              <Upload className="w-3 h-3" />
              {uploading ? "Uploading..." : "+ Add Evidence"}
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadEvidence}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          {dispute.evidence.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
              No evidence photos uploaded yet.
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {dispute.evidence.map((imgUrl, idx) => (
                <a
                  key={idx}
                  href={imgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity shrink-0 bg-slate-100"
                >
                  <img src={imgUrl} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Conversation Thread Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Conversation Thread
          </h4>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 max-h-48 overflow-y-auto space-y-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {dispute.conversation.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No messages in this dispute thread yet.</p>
            ) : (
              dispute.conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "You" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-slate-600">{msg.sender}</span>
                    <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                  </div>
                  <div
                    className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] ${
                      msg.sender === "You"
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : msg.sender === "Admin"
                        ? "bg-amber-100 text-amber-900 border border-amber-200/80 rounded-tl-none font-medium"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Input & Send Action Bar */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 focus:bg-white"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>

      </div>
    </div>
  );
}
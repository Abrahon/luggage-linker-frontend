"use client";

import React, { useEffect, useState } from "react";
import { DisputeItem, getMyDisputes } from "@/api/disputes.api";
import { TravelerDisputeModal } from "./TravelerDisputeModal";
import { Eye, Loader2 } from "lucide-react";

export const TravelerDisputesDashboard = () => {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await getMyDisputes();
      const fetchedDisputes = res.results || [];
      setDisputes(fetchedDisputes);

      // Keep selected dispute updated if modal is currently open
      if (selectedDispute) {
        const updated = fetchedDisputes.find((d) => d.id === selectedDispute.id);
        if (updated) setSelectedDispute(updated);
      }
    } catch (err) {
      console.error("Failed to fetch traveler disputes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Title Header (Read-Only context for traveler) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Traveler Dispute Claims
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review claims against your trips, present evidence, and communicate with support.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex items-center justify-center text-xs">
            <Loader2 size={20} className="animate-spin mr-2 text-emerald-600" />
            Loading claims...
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Dispute ID</th>
                  <th className="py-3 px-4">Tracking No.</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Opened By</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {disputes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-400">
                      No active dispute claims recorded.
                    </td>
                  </tr>
                ) : (
                  disputes.map((item) => {
                    const trackingNo =
                      typeof item.booking === "object"
                        ? item.booking?.tracking_number
                        : item.booking;

                    const packageName =
                      typeof item.booking === "object"
                        ? item.booking?.package_details || "Shipment Item"
                        : "Shipment Item";

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-gray-900 font-semibold">
                          #{item.id.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-600">
                          {trackingNo || "N/A"}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {packageName}
                        </td>
                        <td className="py-3 px-4">
                          {item.opened_by?.full_name || item.opened_by?.email || "Sender"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded font-medium">
                            {item.reason_display || item.reason}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          ${item.disputed_amount}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              item.status === "OPEN"
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : item.status === "UNDER_REVIEW"
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            }`}
                          >
                            ● {item.status_display || item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(item.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedDispute(item)}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedDispute && (
        <TravelerDisputeModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onRefresh={fetchDisputes}
        />
      )}
    </div>
  );
};
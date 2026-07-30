"use client";

import React, { useEffect, useState } from "react";
import { HelpCircle, Package, Truck, ShieldCheck, Calendar, Clock, DollarSign } from "lucide-react";
import { getPendingReleases, PendingReleaseItem } from "@/api/wallets.api";

export function PendingReleasesCard() {
  const [pendingEarnings, setPendingEarnings] = useState<PendingReleaseItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPendingReleases();
  }, []);

  const fetchPendingReleases = async () => {
    try {
      setIsLoading(true);
      const res = await getPendingReleases();
      if (res?.success && Array.isArray(res.data)) {
        setPendingEarnings(res.data);
      } else {
        setPendingEarnings([]);
      }
    } catch (err) {
      console.error("Failed to load pending releases:", err);
      setPendingEarnings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amountStr: string, currencyStr: string) => {
    const val = parseFloat(amountStr) || 0;
    const symbol = currencyStr === "USD" ? "$" : `${currencyStr} `;
    return `${symbol}${val.toFixed(2)}`;
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
          <span>Pending Releases</span>
          <span
            title="Funds held securely until transport verifies shipment arrivals"
            className="cursor-help flex items-center"
          >
            <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
          </span>
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Secured amounts queued for automated settlement
        </p>

        {/* Card List */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="text-center py-8 text-xs text-gray-400">
              Loading pending releases...
            </div>
          ) : pendingEarnings.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 border border-dashed rounded-xl">
              No pending releases found.
            </div>
          ) : (
            pendingEarnings.map((pnd) => (
              <div
                key={pnd.id}
                className="p-4 bg-gray-50/70 border border-gray-100 rounded-xl space-y-3"
              >
                {/* Package Name & Tracking */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📦</span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        {pnd.package}
                      </h4>
                      <p className="text-[11px] text-gray-400 font-mono">
                        Tracking: {pnd.tracking_number}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Status */}
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Status</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 mt-0.5">
                      <span className="text-[8px]">🟡</span> {pnd.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Escrow Status */}
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Escrow</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200/60 mt-0.5">
                      <span className="text-[8px]">🟠</span> {pnd.escrow_status}
                    </span>
                  </div>

                  {/* Expected Arrival */}
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Expected Arrival</span>
                    <span className="text-[11px] font-semibold text-gray-700 mt-0.5 block">
                      {formatDate(pnd.expected_release)}
                    </span>
                  </div>

                  {/* Release Rule */}
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Release</span>
                    <span className="text-[10px] text-gray-500 mt-0.5 block leading-tight">
                      After sender confirms delivery
                    </span>
                  </div>
                </div>

                {/* Reward Footer */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-500">Reward</span>
                  <span className="text-sm font-extrabold text-emerald-600">
                    +{formatCurrency(pnd.reward, pnd.currency)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-400 italic mt-4 text-center">
        Funds process out of escrow instantly following traveler order confirmations.
      </p>
    </div>
  );
}
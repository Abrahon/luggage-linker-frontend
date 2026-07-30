"use client";

import React, { useEffect, useState } from "react";
import { getWalletLedger, WalletLedgerItem } from "@/api/wallets.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function RecentActivityLedger() {
  const [ledger, setLedger] = useState<WalletLedgerItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const fetchLedgerData = async () => {
    try {
      setIsLoading(true);
      const res = await getWalletLedger();
      if (res?.success && Array.isArray(res.data)) {
        setLedger(res.data);
      } else {
        setLedger([]);
      }
    } catch (err) {
      console.error("Failed to load wallet ledger:", err);
      setLedger([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "FAILED":
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-900">Recent Activity Ledger</h3>
      <p className="text-xs text-gray-400 mb-4">
        Complete tracking of standard inflow and outflow records
      </p>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50/60">
            <TableRow>
              <TableHead className="text-xs font-semibold py-2">Reference</TableHead>
              <TableHead className="text-xs font-semibold py-2">Date</TableHead>
              <TableHead className="text-xs font-semibold py-2">Type</TableHead>
              <TableHead className="text-xs font-semibold py-2">Status</TableHead>
              <TableHead className="text-xs font-semibold py-2 text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-xs text-gray-400"
                >
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : ledger.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-6 text-xs text-gray-400"
                >
                  No ledger activity recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              ledger.map((txn) => {
                const numericAmount = parseFloat(txn.amount) || 0;
                const isPositive = numericAmount > 0;

                return (
                  <TableRow
                    key={txn.reference}
                    className="hover:bg-gray-50/40 transition-colors"
                  >
                    {/* 1. Reference */}
                    <TableCell className="py-2.5">
                      <span className="text-xs font-semibold text-gray-800 font-mono">
                        {txn.reference}
                      </span>
                    </TableCell>

                    {/* 2. Transaction Date */}
                    <TableCell className="py-2.5">
                      <span className="text-[11px] text-gray-500 whitespace-nowrap">
                        {formatDate(txn.transaction_date)}
                      </span>
                    </TableCell>

                    {/* 3. Transaction Type */}
                    <TableCell className="py-2.5">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded font-medium inline-block whitespace-nowrap",
                          isPositive
                            ? "bg-green-50 text-green-700"
                            : "bg-purple-50 text-purple-700"
                        )}
                      >
                        {txn.transaction_type}
                      </span>
                    </TableCell>

                    {/* 4. Status */}
                    <TableCell className="py-2.5">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium border inline-block whitespace-nowrap uppercase tracking-wider",
                          getStatusBadgeClass(txn.status)
                        )}
                      >
                        {txn.status}
                      </span>
                    </TableCell>

                    {/* 5. Amount */}
                    <TableCell
                      className={cn(
                        "text-xs font-bold text-right py-2.5 whitespace-nowrap",
                        isPositive ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {isPositive ? "+" : "-"}
                      ${Math.abs(numericAmount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
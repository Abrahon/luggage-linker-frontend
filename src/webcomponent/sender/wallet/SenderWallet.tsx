"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Wallet as WalletIcon,
  PlusCircle,
  Clock,
  ArrowUpRight,
  RotateCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Copy,
  Check,
  Loader2,
  Receipt,
  ArrowRight,
} from "lucide-react";

import {
  getWalletSummary,
  getWalletTransactions,
  getTransactionDetail,
  WalletSummary,
  Transaction,
} from "@/api/wallet.api";

import { TopUpModal } from "./TopUpModal";

export const SenderWallet: React.FC = () => {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);

  // Modal State for Transaction Details
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      const summaryData = await getWalletSummary();
      setSummary(summaryData);
    } catch (err) {
      console.error("Failed to load wallet summary:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (currentPage: number) => {
    try {
      setTxLoading(true);
      const res = await getWalletTransactions(currentPage);
      setTransactions(res.results);
      setTotalCount(res.count);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  useEffect(() => {
    fetchTransactions(page);
  }, [page, fetchTransactions]);

  const handleOpenDetails = async (tx: Transaction) => {
    setSelectedTx(tx);
    setModalLoading(true);
    try {
      const detailedTx = await getTransactionDetail(tx.id);
      setSelectedTx(detailedTx);
    } catch (err) {
      console.error("Failed to fetch transaction details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  /**
   * Helper to normalize transaction type strings safely
   */
  const getNormalizedType = (tx: Transaction) => {
    const rawType = tx?.transaction_type || tx?.type || "";
    return rawType.toString().trim().toUpperCase().replace(/\s+/g, "_");
  };

  /**
   * Complete Badge Mapping Function
   */
  const getTransactionBadge = (tx: Transaction) => {
    const type = getNormalizedType(tx);

    switch (type) {
      case "TOPUP":
        return {
          label: "Top Up",
          dot: "🟢",
          badgeBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "ESCROW_HOLD":
        return {
          label: "Escrow Hold",
          dot: "🟠",
          badgeBg: "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
        };
      case "ESCROW_RELEASE":
      case "ESCROW_RELEASED":
      case "ESCROW_PAYOUT":
      case "RELEASE":
        return {
          label: "Escrow Released",
          dot: "🔴",
          badgeBg: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
        };
      case "REFUND":
        return {
          label: "Refund",
          dot: "🟢",
          badgeBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "DISPUTE_REFUND":
        return {
          label: "Dispute Refund",
          dot: "🟣",
          badgeBg: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
        };
      case "DISPUTE_PAYOUT":
        return {
          label: "Dispute Payout",
          dot: "🔷",
          badgeBg: "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
        };
      case "WITHDRAWAL":
        return {
          label: "Withdrawal",
          dot: "🔴",
          badgeBg: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
        };
      case "WITHDRAWAL_CANCEL":
        return {
          label: "Withdrawal Cancel",
          dot: "🟡",
          badgeBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        };
      default:
        return {
          label: type || "Transaction",
          dot: "⚪",
          badgeBg: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        };
    }
  };

  const getStatusBadge = (statusStr?: string) => {
    const status = statusStr?.toUpperCase() || "COMPLETED";

    if (status === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800">
          <span>🟡</span> Pending
        </span>
      );
    }

    if (status === "FAILED" || status === "CANCELLED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-800">
          <span>🔴</span> Failed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">
        <span>🟢</span> Completed
      </span>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const totalPages = Math.ceil(totalCount / 10) || 1;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <WalletIcon className="w-8 h-8 text-emerald-600" />
            Wallet & Billing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage your funds, track escrow holds, and view transaction history.
          </p>
        </div>

        <button
          onClick={() => setIsTopUpOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-md hover:shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          Add Money
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Balance
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600">
              <WalletIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              ${parseFloat(summary?.available_balance || "0.00").toFixed(2)}
            </p>
            <span className="inline-block mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
              Ready to Use
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Escrow
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              ${parseFloat(summary?.pending_balance || "0.00").toFixed(2)}
            </p>
            <span className="inline-block mt-2 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 px-2.5 py-0.5 rounded-full">
              On Hold for Bookings
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Spent
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              ${(summary?.total_spent || 0).toFixed(2)}
            </p>
            <span className="inline-block mt-2 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
              Completed Orders
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Refunded
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg text-purple-600">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              ${(summary?.total_refunded || 0).toFixed(2)}
            </p>
            <span className="inline-block mt-2 text-xs font-medium text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400 px-2.5 py-0.5 rounded-full">
              Disputes & Cancellations
            </span>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Transaction History
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {totalCount} Total
          </span>
        </div>

        {/* Table View */}
        {txLoading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p className="font-semibold text-slate-600 dark:text-slate-400">
              No transactions found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Top up your wallet or place a booking to see activity here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Balance Change</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {transactions.map((tx) => {
                  const style = getTransactionBadge(tx);
                  const typeUpper = getNormalizedType(tx);
                  const amountNum = parseFloat(tx.amount || "0");
                  
                  // Check if this transaction represents a deduction/payout/release
                  const isDeduction =
                    [
                      "ESCROW_RELEASE",
                      "ESCROW_RELEASED",
                      "ESCROW_PAYOUT",
                      "ESCROW_HOLD",
                      "WITHDRAWAL",
                      "RELEASE",
                    ].includes(typeUpper) || amountNum < 0;

                  const formattedDate = new Date(tx.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  const balanceAfter = parseFloat(tx.balance_after || "0");
                  const balanceBefore = parseFloat(tx.balance_before || "0");

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Type Badge */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style.badgeBg}`}
                        >
                          <span>{style.dot}</span> {style.label}
                        </span>
                      </td>

                      {/* AMOUNT COLUMN (Hard-guaranteed Red color for deductions via inline style + Tailwind) */}
                      <td
                        className={`py-4 px-6 whitespace-nowrap font-bold ${
                          isDeduction
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                        style={{ color: isDeduction ? "#dc2626" : undefined }}
                      >
                        {isDeduction ? "-" : "+"}${Math.abs(amountNum).toFixed(2)}
                      </td>

                      {/* Balance Shift */}
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 font-mono">
                        ${balanceBefore.toFixed(2)} → ${balanceAfter.toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(tx.status)}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-400 font-medium">
                        {formattedDate}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleOpenDetails(tx)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || txLoading}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>

              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || txLoading}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Transaction Details
                </h3>
                {modalLoading && (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin ml-2" />
                )}
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {(() => {
                const modalTypeUpper = getNormalizedType(selectedTx);
                const modalAmountNum = parseFloat(selectedTx.amount || "0");
                const isModalDeduction =
                  [
                    "ESCROW_RELEASE",
                    "ESCROW_RELEASED",
                    "ESCROW_PAYOUT",
                    "ESCROW_HOLD",
                    "WITHDRAWAL",
                    "RELEASE",
                  ].includes(modalTypeUpper) || modalAmountNum < 0;

                return (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-medium">
                        Total Amount
                      </span>
                      <p
                        className={`text-2xl font-extrabold ${
                          isModalDeduction ? "text-red-600" : "text-emerald-600"
                        }`}
                        style={{ color: isModalDeduction ? "#dc2626" : "#16a34a" }}
                      >
                        {isModalDeduction ? "-" : "+"}${Math.abs(modalAmountNum).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 uppercase font-medium block mb-1">
                        Status
                      </span>
                      {getStatusBadge(selectedTx.status_display || selectedTx.status)}
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Transaction Type</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      getTransactionBadge(selectedTx).badgeBg
                    }`}
                  >
                    <span>{getTransactionBadge(selectedTx).dot}</span>
                    {getTransactionBadge(selectedTx).label}
                  </span>
                </div>

                <div className="py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400 block text-xs font-medium uppercase mb-1">
                    Description
                  </span>
                  <p className="text-slate-900 dark:text-slate-200 font-medium">
                    {selectedTx.description || "No description available."}
                  </p>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-500 dark:text-slate-400">Balance Shift</span>
                  <span className="flex items-center gap-1.5 font-mono text-slate-800 dark:text-slate-200 font-semibold text-xs">
                    ${parseFloat(selectedTx.balance_before || "0").toFixed(2)}
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    ${parseFloat(selectedTx.balance_after || "0").toFixed(2)}
                  </span>
                </div>

                {selectedTx.reference && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400">Reference / ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        {selectedTx.reference}
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedTx.reference || "")}
                        className="text-slate-400 hover:text-emerald-600 transition-colors p-1 cursor-pointer"
                        title="Copy Reference"
                      >
                        {copiedRef ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {(selectedTx.tracking_number || selectedTx.booking_tracking_number) && (
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400">Tracking Number</span>
                    <span className="font-semibold text-emerald-600">
                      #{selectedTx.tracking_number || selectedTx.booking_tracking_number}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 dark:text-slate-400">Date & Time</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                    {new Date(selectedTx.created_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "medium",
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Top-up Modal */}
      <TopUpModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />

    </div>
  );
};
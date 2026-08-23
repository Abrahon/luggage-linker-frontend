"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  getWithdrawals,
  getWithdrawalStats,
  WithdrawalItem,
  WithdrawalResponse,
  WithdrawalStatsData,
  WithdrawalStatsResponse,
} from "@/api/wallets.api";

export const WithdrawalHistory = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [stats, setStats] = useState<WithdrawalStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both history and stats concurrently
      const [historyRes, statsRes]: [WithdrawalResponse, WithdrawalStatsResponse] =
        await Promise.all([getWithdrawals(), getWithdrawalStats()]);

      if (historyRes.success && Array.isArray(historyRes.data)) {
        setWithdrawals(historyRes.data);
      } else {
        setWithdrawals([]);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while loading withdrawal history."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper: Format Dates safely
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Helper: Render Status Badge
  const renderStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
      case "PENDING":
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
      case "CANCELLED":
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-full">
            <XCircle className="w-3.5 h-3.5 text-gray-500" />
            {status === "REJECTED" ? "Rejected" : "Cancelled"}
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-full">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-8 mt-6">
      {/* Stats Cards Section */}
      <div className="space-y-4">
        {/* Section Heading */}
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Withdrawal Overview
          </h2>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Withdrawals */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total Requests
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {stats?.total_withdrawals ?? (isLoading ? "..." : 0)}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </motion.div>

          {/* Completed */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Completed
              </p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {stats?.completed ?? (isLoading ? "..." : 0)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </motion.div>

          {/* Pending */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Pending
              </p>
              <h3 className="text-2xl font-black text-amber-500 mt-1">
                {stats?.pending ?? (isLoading ? "..." : 0)}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </motion.div>

          {/* Failed / Rejected */}
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Failed / Rejected
              </p>
              <h3 className="text-2xl font-black text-rose-500 mt-1">
                {stats?.failed_rejected ?? (isLoading ? "..." : 0)}
              </h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle className="w-5 h-5" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Withdrawal History Table Container */}
      <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Table Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Withdrawal History
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Track and monitor all your payout requests
              </p>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <p className="text-sm font-medium">Loading requests...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <p>{error}</p>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-base font-medium">No withdrawal requests found</p>
            <p className="text-xs text-gray-400 mt-1">
              When you request a payout, it will show up here.
            </p>
          </div>
        ) : (
          /* Requests Table */
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payout Method</th>
                  <th className="py-3 px-4">Requested On</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {withdrawals.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    {/* Amount */}
                    <td className="py-4 px-4 font-semibold text-gray-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 text-gray-700 rounded-lg group-hover:bg-gray-200 transition">
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <span>
                          ${parseFloat(item.amount || "0").toFixed(2)}
                        </span>
                      </div>
                    </td>

                    {/* Withdrawal Method */}
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-2.5">
                        <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800 leading-tight">
                            {item.withdrawal_method?.bank_name ||
                              item.withdrawal_method?.type_display ||
                              "Withdrawal Account"}
                          </span>
                          {item.withdrawal_method?.account_name && (
                            <span className="text-xs text-gray-500 mt-0.5">
                              {item.withdrawal_method.account_name}{" "}
                              {item.withdrawal_method.account_number
                                ? `(${item.withdrawal_method.account_number})`
                                : ""}
                            </span>
                          )}
                          {item.withdrawal_method?.branch_name && (
                            <span className="text-[11px] text-gray-400">
                              {item.withdrawal_method.branch_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Created At */}
                    <td className="py-4 px-4 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(item.created_at)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {renderStatusBadge(item.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
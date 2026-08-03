"use client";

import React, { useEffect, useState } from "react";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { Clock, DollarSign, Wallet, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { PaymentHistoryTable } from "./PaymentHistoryTable";
import {
  getSenderPaymentSummary,
  getSenderPaymentHistory,
  PaymentSummaryData,
  PaymentHistoryItem,
} from "@/api/payments.api";

export const SenderPayment = () => {
  const [summary, setSummary] = useState<PaymentSummaryData | null>(null);
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [summaryRes, historyRes] = await Promise.all([
        getSenderPaymentSummary(),
        getSenderPaymentHistory(),
      ]);

      setSummary(summaryRes.data);
      setHistory(historyRes.results || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load payment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  // Card Configurations
  const cardsData = [
    {
      title: "Total Paid",
      money: `$${parseFloat(summary?.total_paid || "0").toFixed(2)}`,
      text: "Total funds spent across deliveries",
      icon: <Wallet className="w-5 h-5 text-blue-600" />,
      bg: "bg-blue-50/50 dark:bg-blue-950/30",
      border: "border-blue-100 dark:border-blue-900/50",
    },
    {
      title: "Escrow Held",
      money: `$${parseFloat(summary?.escrow_held || "0").toFixed(2)}`,
      text: "Funds securely held in escrow",
      icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
      bg: "bg-purple-50/50 dark:bg-purple-950/30",
      border: "border-purple-100 dark:border-purple-900/50",
    },
    {
      title: "Released",
      money: `$${parseFloat(summary?.released || "0").toFixed(2)}`,
      text: "Amount released to travelers",
      icon: <Clock className="w-5 h-5 text-teal-600" />,
      bg: "bg-teal-50/50 dark:bg-teal-950/30",
      border: "border-teal-100 dark:border-teal-900/50",
    },
    {
      title: "Refunded",
      money: `$${parseFloat(summary?.refunded || "0").toFixed(2)}`,
      text: "Refunded payments returned",
      icon: <DollarSign className="w-5 h-5 text-amber-600" />,
      bg: "bg-amber-50/50 dark:bg-amber-950/30",
      border: "border-amber-100 dark:border-amber-900/50",
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8 px-4 sm:px-6 lg:px-10 py-8 text-slate-800">
      {/* Overview & Header */}
      <div className="w-full flex flex-col gap-4">
        <div className="w-full flex justify-between items-center">
          <HeadingSection
            heading="My Payments"
            subheading="Manage your delivery payments & track your package expenses easily."
          />
          <button
            onClick={fetchPaymentData}
            disabled={loading}
            className="p-2.5 text-slate-500 hover:text-slate-900 transition rounded-xl border border-slate-200 bg-white shadow-2xs cursor-pointer"
            title="Refresh Payments"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
          </button>
        </div>

        {/* 4 Columns in 1 Row Layout Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardsData.map((card, idx) => (
            <div
              key={idx}
              className={`w-full p-5 rounded-2xl bg-white border shadow-2xs flex flex-col justify-between space-y-3 transition-all hover:shadow-sm ${card.border}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  {card.icon}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {loading ? "..." : card.money}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {card.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History Table Section */}
      <div className="w-full flex flex-col gap-4">
        <HeadingSection
          heading="Payment History"
          subheading="Your complete transaction audit log"
        />
        <PaymentHistoryTable data={history} loading={loading} />
      </div>
    </div>
  );
};
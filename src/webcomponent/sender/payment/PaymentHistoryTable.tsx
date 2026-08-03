"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentHistoryItem, TransactionStatus } from "@/api/payments.api";
import { Loader2 } from "lucide-react";

interface PaymentHistoryTableProps {
  data: PaymentHistoryItem[];
  loading?: boolean;
}

// Map transaction status from backend
const statusStyles: Record<TransactionStatus, { bg: string; text: string; label: string }> = {
  COMPLETED: { bg: "bg-emerald-100 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", label: "Completed" },
  PENDING: { bg: "bg-amber-100 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", label: "Pending" },
  FAILED: { bg: "bg-rose-100 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-400", label: "Failed" },
};

// Formatter for Transaction Types
const formatTransactionType = (type: string) => {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const PaymentHistoryTable = ({ data, loading }: PaymentHistoryTableProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>Loading transaction history...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        No payment transactions found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
              <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Date</TableHead>
              <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Package Title</TableHead>
              <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Tracking Number</TableHead>
              <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Type</TableHead>
              <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Amount</TableHead>
              <TableHead className="font-semibold text-slate-800 dark:text-slate-200">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((item) => {
              const status = statusStyles[item.transaction_status] || statusStyles.PENDING;
              const isNegative = item.amount.startsWith("-");

              return (
                <TableRow key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                  <TableCell className="py-3 text-slate-600 dark:text-slate-400 font-medium">
                    {item.date}
                  </TableCell>
                  
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    {item.package_title}
                  </TableCell>

                  <TableCell className="text-xs font-mono text-slate-500">
                    {item.tracking_number}
                  </TableCell>

                  <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {formatTransactionType(item.transaction_type)}
                  </TableCell>

                  <TableCell className={`py-3 font-bold ${isNegative ? "text-slate-900 dark:text-white" : "text-emerald-600"}`}>
                    {item.currency === "USD" ? "$" : item.currency} {Math.abs(parseFloat(item.amount)).toFixed(2)}
                  </TableCell>

                  <TableCell className="py-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}
                    >
                      {status.label}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
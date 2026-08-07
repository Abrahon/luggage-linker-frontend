"use client";

import React from "react";
import { XCircle, Wallet } from "lucide-react";
import Link from "next/link";

const WALLET_ROUTE = "/sender-wallet";

export default function TopUpCancelPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cancel Icon */}
        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/60 rounded-full flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
          <XCircle className="w-10 h-10" />
        </div>

        {/* Details */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Payment Cancelled
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Your top-up process was cancelled. No charges were made to your account.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href={WALLET_ROUTE}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-emerald-600/20"
          >
            <Wallet className="w-4 h-4" />
            Back to Wallet
          </Link>
        </div>

      </div>
    </div>
  );
}
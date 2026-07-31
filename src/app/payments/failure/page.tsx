"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCw, ArrowLeft, HelpCircle, AlertTriangle } from "lucide-react";

function PaymentFailureContent() {
  const searchParams = useSearchParams();

  const errorMessage =
    searchParams.get("error") ||
    "The payment process was cancelled or could not be authorized by your payment provider.";

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="bg-rose-600 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Payment Unsuccessful</h1>
          <p className="text-rose-100 text-xs sm:text-sm mt-1.5 font-medium">
            No charges were made to your account.
          </p>
        </div>

        {/* Error Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-100 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                Reason for Failure
              </h3>
              <p className="text-xs text-rose-800 leading-relaxed font-medium">
                {errorMessage}
              </p>
            </div>
          </div>

          {/* Quick Troubleshooting Steps */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Common solutions:
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 font-medium">
              <li>Ensure your payment details and billing address are correct.</li>
              <li>Check if your card has sufficient funds or daily transaction limit.</li>
              <li>Try using a different card or Stripe payment method.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              href="/dashboard/sender"
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Return to Dashboard & Retry</span>
            </Link>

            <Link
              href="/dashboard/sender"
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sender Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Need assistance?
          </span>
          <a href="/support" className="text-blue-600 font-semibold underline">
            Contact Payment Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
      <PaymentFailureContent />
    </Suspense>
  );
}
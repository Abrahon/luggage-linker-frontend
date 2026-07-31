"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Package, ShieldCheck, FileText } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  
  // Retrieve session_id sent by Stripe
  const sessionId = searchParams.get("session_id") || "N/A";

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="bg-emerald-600 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Payment Successful!</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1.5 font-medium">
            Your payment has been secured in escrow.
          </p>
        </div>

        {/* Receipt Details Card */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Stripe Session ID</span>
              <span className="font-mono font-bold text-slate-800 truncate max-w-[200px]" title={sessionId}>
                {sessionId}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Payment Gateway</span>
              <span className="font-semibold text-slate-800">Stripe Escrow</span>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Escrow Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                HELD IN ESCROW
              </span>
            </div>
          </div>

          {/* Security Banner */}
          <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-blue-800">
              Funds will remain securely held in escrow until the traveler delivers your package and delivery is verified.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Package className="w-4 h-4" />
              <span>Go to Sender Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Need help with this order? <a href="/support" className="text-blue-600 font-semibold underline">Contact Support</a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
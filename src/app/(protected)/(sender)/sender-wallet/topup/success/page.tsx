"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Wallet, ShieldCheck } from "lucide-react";
import Link from "next/link";

// Set this to whatever URL appears in your browser address bar when viewing the wallet:
// Use "/protected/sender/sender-wallet" if the URL shows /protected/sender/sender-wallet
// Or "/sender-wallet" if (protected) and (sender) are route groups in parentheses.
const WALLET_ROUTE = "/sender-wallet";

function TopUpSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(WALLET_ROUTE);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        {/* Info */}
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Top-Up Successful!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Your payment has been processed and your wallet balance has been updated.
          </p>
        </div>

        {/* Transaction Reference Box */}
        {sessionId && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-left space-y-1">
            <span className="text-xs uppercase font-semibold text-slate-400 block">
              Stripe Session ID
            </span>
            <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">
              {sessionId}
            </p>
          </div>
        )}

        {/* Auto Redirect Banner */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-2.5 px-4 rounded-xl border border-emerald-200/60 dark:border-emerald-800/50">
          <ShieldCheck className="w-4 h-4" />
          <span>Redirecting to wallet in {countdown}s...</span>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href={WALLET_ROUTE}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-emerald-600/20"
          >
            <Wallet className="w-4 h-4" />
            Return to Wallet Immediately
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function TopUpSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TopUpSuccessContent />
    </Suspense>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import {
  Wifi,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { getTravelerWalletCard, TravelerWalletCardData } from "@/api/wallet.api";

export function TravelerWalletCard() {
  const [walletCard, setWalletCard] = useState<TravelerWalletCardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetchCardData();
  }, []);

  const fetchCardData = async () => {
    try {
      setIsLoading(true);
      const res = await getTravelerWalletCard();
      if (res?.success && res.data) {
        setWalletCard(res.data);
      }
    } catch (err) {
      console.error("Failed to load traveler card data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!walletCard?.card_details?.card_number_full) return;
    navigator.clipboard.writeText(walletCard.card_details.card_number_full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe fallback parses
  const availableBalance = parseFloat(String(walletCard?.available_balance || 0));
  const heldInEscrow = parseFloat(String(walletCard?.held_in_escrow || 0));
  const pendingPayout = parseFloat(String(walletCard?.pending_payout || 0));
  const currency = walletCard?.currency || "USD";
  const cardDetails = walletCard?.card_details;

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto aspect-[1.586/1] rounded-3xl bg-slate-900 animate-pulse flex items-center justify-center text-slate-500 text-xs font-medium">
        Loading Wallet Card...
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4 font-sans select-none">
      {/* ========================================================= */}
      {/* LUXURY DEBIT CARD                                        */}
      {/* ========================================================= */}
      <div className="relative aspect-[1.586/1] w-full rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl border border-slate-800/80 overflow-hidden group">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 h-60 w-60 rounded-full bg-indigo-500/15 blur-3xl group-hover:bg-indigo-500/25 transition-all duration-700" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          
          {/* HEADER ROW */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
                <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">
                Traveler Pass
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Wifi className="h-4 w-4 rotate-90 text-slate-400" />
              <span className="text-xs font-black tracking-widest text-slate-400 italic">
                VISA
              </span>
            </div>
          </div>

          {/* MID ROW: Chip & Available Balance */}
          <div className="my-auto space-y-2">
            <div className="flex items-center justify-between">
              {/* Gold Chip */}
              <div className="h-8 w-11 rounded-md bg-gradient-to-tr from-amber-200 via-amber-300 to-amber-100 border border-amber-400/60 shadow-md relative overflow-hidden">
                <div className="absolute inset-x-0 top-1/2 h-px bg-amber-700/40" />
                <div className="absolute inset-y-0 left-1/3 w-px bg-amber-700/40" />
                <div className="absolute inset-y-0 right-1/3 w-px bg-amber-700/40" />
              </div>

              {/* Show / Hide Toggle Button */}
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1.5 rounded-full bg-slate-800/90 hover:bg-slate-800 border border-slate-700/70 px-3 py-1 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-xs cursor-pointer"
              >
                {showDetails ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>

            {/* DYNAMIC BALANCE READOUT */}
            <div className="pt-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                Available Balance
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-baseline gap-1.5">
                {showDetails ? (
                  <>
                    ${availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    <span className="text-xs text-emerald-400 font-bold tracking-wider">
                      {currency}
                    </span>
                  </>
                ) : (
                  <span className="tracking-widest text-slate-300 font-mono">
                    ••••••
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: Card Number & Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm sm:text-base tracking-widest text-slate-100 font-semibold">
                {showDetails
                  ? cardDetails?.card_number_full.replace(/(.{4})/g, "$1 ").trim()
                  : cardDetails?.card_number_masked}
              </p>
              {showDetails && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
                  title="Copy Card Number"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            <div className="flex items-end justify-between border-t border-slate-800/80 pt-2 text-[10px]">
              <div>
                <span className="text-slate-500 uppercase font-semibold text-[9px] block tracking-wider">
                  Card Holder
                </span>
                <span className="font-bold text-slate-200 tracking-wider uppercase">
                  {cardDetails?.card_holder_name || walletCard?.full_name}
                </span>
              </div>

              <div className="flex gap-4">
                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[9px] block tracking-wider">
                    Expires
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {showDetails ? cardDetails?.expiry_date : "••/••"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[9px] block tracking-wider">
                    CVV
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {showDetails ? cardDetails?.cvv : "•••"}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
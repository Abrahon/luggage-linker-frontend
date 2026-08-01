"use client";

import React, { useEffect, useState, useCallback } from "react";
import { SenderDashboardStats, getSenderDashboardStats } from "@/api/booking.api";
import { Clock, Package, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const BookingDashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<SenderDashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await getSenderDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load dashboard stats.");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Pending Requests */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Pending Requests
          </span>
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          {loadingStats ? (
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          ) : (
            <span className="text-3xl font-black text-slate-900">
              {stats?.pending_requests ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Active Bookings */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Active Bookings
          </span>
          <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          {loadingStats ? (
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          ) : (
            <span className="text-3xl font-black text-slate-900">
              {stats?.active_bookings ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Completed Bookings */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Completed
          </span>
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          {loadingStats ? (
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          ) : (
            <span className="text-3xl font-black text-slate-900">
              {stats?.completed_bookings ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Escrow Held Amount */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 shadow-2xs hover:shadow-xs transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Escrow Held
          </span>
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-1.5">
          {loadingStats ? (
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          ) : (
            <>
              <span className="text-3xl font-black text-emerald-400">
                ${stats?.total_escrow_held.amount ?? "0.00"}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {stats?.total_escrow_held.currency ?? "USD"}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
"use client";

import React, { useEffect, useState } from "react";
import {
  Package,
  FileEdit,
  Globe,
  GitMerge,
  BookmarkCheck,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  getPackageDashboardStats,
  PackageDashboardStats,
} from "@/api/sender.package.api";
import { toast } from "sonner";

interface StatConfigItem {
  key: keyof PackageDashboardStats;
  title: string;
  icon: React.ElementType;
  style: string;
}

const STATS_CONFIG: StatConfigItem[] = [
  {
    key: "total",
    title: "Total Packages",
    icon: Package,
    style: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
  },
  {
    key: "draft",
    title: "Drafts",
    icon: FileEdit,
    style: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
  },
  {
    key: "published",
    title: "Published",
    icon: Globe,
    style: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50",
  },
  {
    key: "matched",
    title: "Matched",
    icon: GitMerge,
    style: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/50",
  },
  {
    key: "booked",
    title: "Booked",
    icon: BookmarkCheck,
    style: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/50",
  },
  {
    key: "delivered",
    title: "Delivered",
    icon: CheckCircle2,
    style: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
  },
];

interface PackageStatsCardsProps {
  onStatClick?: (statusKey: string) => void;
  selectedStatus?: string;
}

export function PackageStatsCards({
  onStatClick,
  selectedStatus,
}: PackageStatsCardsProps) {
  const [stats, setStats] = useState<PackageDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchBackendStats = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await getPackageDashboardStats();
      
      // Extracts backend response payload structure
      const payload = (response as any)?.data || response;
      setStats(payload);
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        "Failed to fetch package stats from backend.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBackendStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-6 w-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-3">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Package Statistics
        </h3>
        <button
          onClick={() => fetchBackendStats(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Backend Live Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATS_CONFIG.map((item) => {
          const Icon = item.icon;
          const count = stats[item.key] ?? 0;
          const isSelected = selectedStatus === item.key;

          return (
            <div
              key={item.key}
              onClick={() => onStatClick && onStatClick(item.key)}
              className={`p-5 bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                onStatClick ? "cursor-pointer hover:scale-[1.02]" : ""
              } ${
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                  : "border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md"
              }`}
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {count.toLocaleString()}
                </p>
              </div>

              <div className={`p-2.5 rounded-xl border ${item.style}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
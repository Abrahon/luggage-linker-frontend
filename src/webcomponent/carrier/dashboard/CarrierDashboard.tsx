'use client';

import React, { useEffect, useState } from "react";
import { Card, Breadcrumb } from "@/webcomponent/reusable";
import { CardProps } from "@/interface/Card";
import {
  getTravelerStats,
  getTravelerMonthlyEarnings,
  getTravelerRecentActivities,
  TravelerStatsData,
  MonthlyChartItem,
  RecentActivityItem,
} from "@/api/traveler.api";

const initialTravelerStats: TravelerStatsData = {
  available_balance: "0.00",
  active_deliveries: 0,
  active_trips: 0,
  pending_requests: 0,
  rating: "0.00",
  completed_deliveries: 0,
  pending_earnings: "0.00",
  lifetime_earnings: "0.00",
};

export const CarrierDashboard = () => {
  const [stats, setStats] = useState<TravelerStatsData>(initialTravelerStats);
  const [chartData, setChartData] = useState<MonthlyChartItem[]>([]);
  const [totalYearEarnings, setTotalYearEarnings] = useState<string>("0.00");
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    const [statsRes, earningsRes, activitiesRes] = await Promise.allSettled([
      getTravelerStats(),
      getTravelerMonthlyEarnings(),
      getTravelerRecentActivities(),
    ]);

    let hasSuccess = false;

    // 1. Process Traveler Stats
    if (statsRes.status === "fulfilled" && statsRes.value?.data) {
      setStats(statsRes.value.data);
      hasSuccess = true;
    } else {
      console.warn("Stats API call failed or returned empty:", statsRes);
    }

    // 2. Process Monthly Earnings
    if (earningsRes.status === "fulfilled" && earningsRes.value?.data) {
      setChartData(earningsRes.value.data.chart_data || []);
      setTotalYearEarnings(earningsRes.value.data.total_year_earnings || "0.00");
      hasSuccess = true;
    } else {
      console.warn("Earnings API call failed or returned empty:", earningsRes);
    }

    // 3. Process Recent Activities
    if (activitiesRes.status === "fulfilled" && Array.isArray(activitiesRes.value?.data)) {
      setActivities(activitiesRes.value.data);
      hasSuccess = true;
    } else {
      console.warn("Activities API call failed or returned empty:", activitiesRes);
    }

    // Show persistent error UI ONLY if all calls fail AND we have zero default data display
    if (!hasSuccess) {
      const statsErr: any = statsRes.status === "rejected" ? statsRes.reason : null;
      const status = statsErr?.response?.status;

      if (status === 401 || status === 403) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Unable to connect to backend server. Verify DevTunnel connection.");
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 my-8 bg-red-50 border border-red-200 rounded-xl text-center text-red-600 max-w-lg mx-auto">
        <p className="font-semibold text-sm">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const statCards: CardProps[] = [
    {
      icon: "https://api.iconify.design/lucide:wallet.svg?color=%234f46e5",
      title: "Available Balance",
      quantity: `$${stats.available_balance}`,
      sugtitle: "Available Balance",
    },
    {
      icon: "https://api.iconify.design/lucide:truck.svg?color=%234f46e5",
      title: "Active Deliveries",
      quantity: stats.active_deliveries,
      sugtitle: "Active Deliveries",
    },
    {
      icon: "https://api.iconify.design/lucide:map.svg?color=%234f46e5",
      title: "Active Trips",
      quantity: stats.active_trips,
      sugtitle: "Active Trips",
    },
    {
      icon: "https://api.iconify.design/lucide:clipboard-list.svg?color=%2364748b",
      title: "Pending Requests",
      quantity: stats.pending_requests,
      sugtitle: "Pending Requests",
    },
    {
      icon: "https://api.iconify.design/lucide:star.svg?color=%23eab308",
      title: "Rating",
      quantity: stats.rating,
      sugtitle: "Rating",
    },
    {
      icon: "https://api.iconify.design/lucide:check-circle.svg?color=%2310b981",
      title: "Completed Deliveries",
      quantity: stats.completed_deliveries,
      sugtitle: "Completed Deliveries",
    },
    {
      icon: "https://api.iconify.design/lucide:banknote.svg?color=%2364748b",
      title: "Pending Earnings",
      quantity: `$${stats.pending_earnings}`,
      sugtitle: "Pending Earnings",
    },
    {
      icon: "https://api.iconify.design/lucide:dollar-sign.svg?color=%2310b981",
      title: "Lifetime Earnings",
      quantity: `$${stats.lifetime_earnings}`,
      sugtitle: "Lifetime Earnings",
    },
  ];

  const numericEarnings = chartData.map((d) => parseFloat(d.earnings) || 0);
  const maxAmount = Math.max(...numericEarnings, 1);

  return (
    <div className="flex flex-col gap-4 px-3 py-4 text-slate-900 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <Breadcrumb
        title="Traveler Dashboard"
        subtitle="Your Lifetime earnings from deliveries"
        math={[
          {
            mhki: `$${stats.lifetime_earnings}`,
            mhki_subtitle: `From ${stats.completed_deliveries} completed deliveries`,
          },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {statCards.map((cardProps, index) => (
          <Card key={index} {...cardProps} />
        ))}
      </div>

      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Monthly Earnings Chart
            </h3>
            <p className="text-xs text-slate-500">
              Total Year Revenue: <span className="font-bold">${totalYearEarnings}</span>
            </p>
          </div>
        </div>

        <div className="h-60 w-full flex items-end justify-between gap-2 pt-4 border-b border-slate-100">
          {chartData.length === 0 ? (
            <p className="text-xs text-slate-400 m-auto">No monthly earnings recorded yet.</p>
          ) : (
            chartData.map((data, idx) => {
              const val = parseFloat(data.earnings) || 0;
              const barHeightPercentage = (val / maxAmount) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition bg-slate-900 text-white text-[11px] px-2 py-1 rounded shadow pointer-events-none">
                    ${data.earnings}
                  </div>
                  <div
                    style={{ height: `${Math.max(barHeightPercentage, 4)}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      val > 0 ? "bg-indigo-600 hover:bg-indigo-500" : "bg-slate-100"
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-slate-400 mt-3 h-5">
                    {data.month}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">
          Recent Activity Stream
        </h3>
        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No recent activities found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((act, idx) => (
              <div key={idx} className="py-3 flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{act.title}</p>
                  <p className="text-xs text-slate-500">{act.message}</p>
                </div>
                <span className="text-[11px] text-slate-400">{act.time_ago}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
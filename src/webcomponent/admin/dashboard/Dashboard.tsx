"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { StatCard } from "./StatCard";
import { UserGrowthChart } from "./UserGrowthChart";
import { SenderTravelerChart } from "./SenderCarrierChart";
import { RevenueByMonth } from "./RevenueByMonth";
import { TopRoutes } from "./TripRoutes";
import RecentActivities from "@/components/RecentActivities";
import { getDashboardStatsApi, DashboardStatsData } from "@/api/user.api";

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getDashboardStatsApi();
        setStats(response.data);
      } catch (err: any) {
        console.error("Failed to fetch dashboard stats:", err);
        setError(
          err?.response?.data?.detail ||
            err.message ||
            "Failed to load dashboard statistics."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Safe number formatter
  const formatNumber = (num: number | undefined) =>
    num !== undefined ? num.toLocaleString() : "0";

  // Currency formatter
  const formatCurrency = (val: string | undefined) => {
    const numericVal = parseFloat(val || "0");
    return `$${numericVal.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Stats Grid - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Users"
            value={isLoading ? "..." : formatNumber(stats?.total_users)}
            icon={ArrowUpRight}
          />
          <StatCard
            title="Total Packages"
            value={isLoading ? "..." : formatNumber(stats?.total_packages)}
            icon={ArrowUpRight}
          />
          <StatCard
            title="Total Bookings"
            value={isLoading ? "..." : formatNumber(stats?.total_bookings)}
            icon={ArrowUpRight}
          />
          <StatCard
            title="Platform Revenue"
            value={isLoading ? "..." : formatCurrency(stats?.platform_revenue)}
            icon={ArrowUpRight}
          />
        </div>

        {/* Stats Grid - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Active Deliveries"
            value={isLoading ? "..." : formatNumber(stats?.active_deliveries)}
            icon={ArrowUpRight}
          />
          <StatCard
            title="Completed Deliveries"
            value={isLoading ? "..." : formatNumber(stats?.completed_deliveries)}
            icon={ArrowUpRight}
          />
          <StatCard
            title="Pending Verification"
            value={isLoading ? "..." : formatNumber(stats?.pending_kyc)}
            icon={ArrowUpRight}
          />
          <StatCard
            title="Open Disputes"
            value={isLoading ? "..." : formatNumber(stats?.open_disputes)}
            icon={ArrowUpRight}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <UserGrowthChart />
          </div>
          <div>
            <SenderTravelerChart />
          </div>
        </div>

        {/* Bottom Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueByMonth />
          </div>
          <div>
            <TopRoutes />
          </div>
        </div>

        {/* Recent Activities Section */}
        <div className="mt-6">
          <RecentActivities />
        </div>
      </div>
    </div>
  );
};
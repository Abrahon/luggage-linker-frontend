"use client";

import React, { useEffect, useState } from "react";
import { getMonthlyRevenueApi, MonthlyRevenueItem } from "@/api/user.api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const RevenueByMonth = () => {
  const [data, setData] = useState<MonthlyRevenueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch data using configured API client from @/api/admin
        const result = await getMonthlyRevenueApi();
        setData(result);
      } catch (err: any) {
        console.error("Failed to fetch monthly revenue:", err);
        setError(
          err?.response?.data?.detail ||
            err.message ||
            "An error occurred while loading data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlyRevenue();
  }, []);

  // Format short month label (e.g. "August" -> "Aug")
  const chartData = data.map((item) => ({
    ...item,
    shortMonth: item.month_name ? item.month_name.slice(0, 3) : `M${item.month}`,
    value: item.total_revenue,
  }));

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Revenue by Month
        </h3>
        {isLoading && (
          <span className="text-xs text-gray-400 animate-pulse">
            Loading backend data...
          </span>
        )}
      </div>

      <div className="w-full h-64">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">Loading chart...</p>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-md p-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-md">
            <p className="text-sm text-gray-500">No revenue data available.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />

              {/* Display Shortened Month Name (Jan, Feb, Mar...) */}
              <XAxis
                dataKey="shortMonth"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />

              {/* Currency formatted Y-Axis */}
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                tickFormatter={(val) => `$${val}`}
              />

              {/* Enhanced Tooltip */}
              <Tooltip
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  fontSize: "12px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
                labelStyle={{ color: "#111827", fontWeight: "600" }}
                formatter={(value: any) => [
                  `$${Number(value).toLocaleString()}`,
                  "Total Revenue",
                ]}
              />

              <Bar
                dataKey="value"
                fill="#3B82F6"
                radius={[6, 6, 0, 0]}
                className="transition-colors hover:fill-blue-600"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
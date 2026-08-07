"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { getUserGrowthData, MonthlyGrowthItem } from "@/api/user.api";

// Static array for all 12 months
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const UserGrowthChart = () => {
  const [data, setData] = useState<MonthlyGrowthItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadGrowthData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const growthData = await getUserGrowthData();
        setData(growthData || []);
      } catch (error) {
        console.error("Error loading user growth data:", error);
        setErrorMessage("Failed to load growth data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadGrowthData();
  }, []);

  // Map API response to always output all 12 static months
  const chartData = MONTH_NAMES.map((month) => {
    // Find matching item from API response (case-insensitive search)
    const matchedItem = data.find(
      (item) => item.month_name?.toLowerCase().startsWith(month.toLowerCase())
    );

    return {
      label: month,
      total_users: matchedItem ? matchedItem.total_users : 0,
      active_users: matchedItem ? matchedItem.active_users : 0,
    };
  });

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">User Growth</h3>

      <div className="w-full h-72 relative flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="animate-spin" size={20} />
            Loading chart data...
          </div>
        ) : errorMessage ? (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />

              <XAxis
                dataKey="label"
                interval={0}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />

              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#374151", fontWeight: 600 }}
                formatter={(value: number) => [value, "Total Users"]}
              />

              <Line
                type="monotone"
                dataKey="total_users"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: "#10b981" }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#047857" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
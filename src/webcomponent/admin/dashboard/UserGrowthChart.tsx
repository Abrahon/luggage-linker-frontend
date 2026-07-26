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
        setData(growthData);
      } catch (error) {
        console.error("Error loading user growth data:", error);
        setErrorMessage("Failed to load growth data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadGrowthData();
  }, []);

  // Map backend fields to Recharts chart properties
  const chartData = data.map((item) => ({
    label: `${item.month_name} '${String(item.year).slice(-2)}`,
    total_users: item.total_users,
    active_users: item.active_users,
  }));

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">User Growth</h3>

      <div className="w-full h-64 relative flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="animate-spin" size={20} />
            Loading chart data...
          </div>
        ) : errorMessage ? (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        ) : chartData.length === 0 ? (
          <div className="text-gray-400 text-sm">No growth data available yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />

              <XAxis
                dataKey="label"
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
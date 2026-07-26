"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getUserRoleDistribution, UserRoleDistributionResponse } from "@/api/user.api";

export const SenderTravelerChart = () => {
  const [distributionData, setDistributionData] =
    useState<UserRoleDistributionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State to track hover for interactive counts & percentages
  const [hoveredSegment, setHoveredSegment] = useState<"sender" | "traveler" | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await getUserRoleDistribution();
        setDistributionData(res);
      } catch (error) {
        console.error("Error fetching role distribution:", error);
        setErrorMessage("Failed to load distribution data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex items-center justify-center min-h-[320px]">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Loader2 className="animate-spin" size={20} />
          Loading distribution data...
        </div>
      </div>
    );
  }

  if (errorMessage || !distributionData) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex items-center justify-center min-h-[320px]">
        <div className="text-red-500 text-sm">
          {errorMessage || "No data available."}
        </div>
      </div>
    );
  }

  const sender = distributionData.roles.SENDER || { count: 0, percentage: 0 };
  const traveler = distributionData.roles.TRAVELER || { count: 0, percentage: 0 };

  const senderPercentage = sender.percentage;
  const travelerPercentage = traveler.percentage;

  const circumference = 2 * Math.PI * 70;
  const senderLength = (senderPercentage / 100) * circumference;
  const travelerLength = (travelerPercentage / 100) * circumference;

  // Active hover info calculation
  const activeDetail =
    hoveredSegment === "sender"
      ? { label: "Sender", count: sender.count, pct: sender.percentage, color: "#06b6d4" }
      : hoveredSegment === "traveler"
      ? { label: "Traveler", count: traveler.count, pct: traveler.percentage, color: "#3b82f6" }
      : {
          label: "Total Users",
          count: distributionData.total_users,
          pct: 100,
          color: "#111827",
        };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sender vs Traveler
      </h3>

      <div className="flex flex-col items-center justify-center">
        <div className="relative w-52 h-52 flex items-center justify-center">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 160 160"
          >
            {/* Background track */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#F3F4F6"
              strokeWidth="20"
            />

            {/* Sender Segment */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#06b6d4"
              strokeWidth={hoveredSegment === "sender" ? "24" : "20"}
              strokeDasharray={`${senderLength} ${circumference}`}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredSegment("sender")}
              onMouseLeave={() => setHoveredSegment(null)}
            />

            {/* Traveler Segment */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#3b82f6"
              strokeWidth={hoveredSegment === "traveler" ? "24" : "20"}
              strokeDasharray={`${travelerLength} ${circumference}`}
              strokeDashoffset={-senderLength}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredSegment("traveler")}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span
              className="text-xs font-semibold uppercase tracking-wider transition-colors duration-200"
              style={{ color: activeDetail.color }}
            >
              {activeDetail.label}
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-0.5">
              {activeDetail.count}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              {activeDetail.pct}%
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-6">
        <div
          className={
            "flex items-center gap-2 cursor-pointer p-1.5 rounded-md transition-colors " +
            (hoveredSegment === "sender" ? "bg-cyan-50" : "")
          }
          onMouseEnter={() => setHoveredSegment("sender")}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
          <span className="text-sm font-medium text-gray-700">
            Sender ({sender.count} - {sender.percentage}%)
          </span>
        </div>

        <div
          className={
            "flex items-center gap-2 cursor-pointer p-1.5 rounded-md transition-colors " +
            (hoveredSegment === "traveler" ? "bg-blue-50" : "")
          }
          onMouseEnter={() => setHoveredSegment("traveler")}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm font-medium text-gray-700">
            Traveler ({traveler.count} - {traveler.percentage}%)
          </span>
        </div>
      </div>
    </div>
  );
};
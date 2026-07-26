"use client";

import React, { useEffect, useState } from "react";
import {
  Package,
  Truck,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  LucideIcon,
} from "lucide-react";
import { getRecentActivitiesApi, ActivityItem } from "@/api/user.api";

// Helper function to dynamically map activity type to icon and background color
const getActivityConfig = (type: ActivityItem["type"]): { icon: LucideIcon; color: string } => {
  switch (type) {
    case "MATCH":
      return { icon: Package, color: "text-blue-600 bg-blue-100" };
    case "BOOKING":
      return { icon: CheckCircle, color: "text-green-600 bg-green-100" };
    case "DELIVERY":
      return { icon: Truck, color: "text-purple-600 bg-purple-100" };
    case "PAYMENT":
      return { icon: CreditCard, color: "text-emerald-600 bg-emerald-100" };
    case "KYC":
      return { icon: ShieldCheck, color: "text-indigo-600 bg-indigo-100" };
    case "DISPUTE":
      return { icon: AlertTriangle, color: "text-red-600 bg-red-100" };
    default:
      return { icon: Package, color: "text-gray-600 bg-gray-100" };
  }
};

export default function RecentActivities() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getRecentActivitiesApi();
        setActivities(response.results || []);
      } catch (err: any) {
        console.error("Failed to fetch recent activities:", err);
        setError(
          err?.response?.data?.detail ||
            err.message ||
            "Failed to load recent activities."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activities
          </h2>
          <p className="text-sm text-gray-500">
            Latest activities across the platform
          </p>
        </div>

        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex items-center gap-4 animate-pulse">
              <div className="h-11 w-11 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-center text-sm text-red-500 bg-red-50 rounded-b-2xl">
          {error}
        </div>
      ) : activities.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">
          No recent activities found.
        </div>
      ) : (
        <div className="divide-y">
          {activities.map((activity, index) => {
            const { icon: Icon, color } = getActivityConfig(activity.type);

            return (
              <div
                key={activity.created_at || index}
                className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition"
              >
                <div
                  className={`h-11 w-11 rounded-full flex-shrink-0 flex items-center justify-center ${color}`}
                >
                  <Icon size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">
                    {activity.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 break-words">
                    {activity.description}
                  </p>
                </div>

                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                  {activity.time}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
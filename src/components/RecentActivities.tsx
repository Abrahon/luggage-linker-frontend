"use client";

import {
  Package,
  Truck,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const activities = [
  {
    id: 1,
    title: "Package matched successfully",
    description: "Package #PKG-1025 matched with Trip #TRP-210",
    time: "2 mins ago",
    icon: Package,
    color: "text-blue-600 bg-blue-100",
  },
  {
    id: 2,
    title: "Booking confirmed",
    description: "Booking #BK-302 has been confirmed.",
    time: "10 mins ago",
    icon: CheckCircle,
    color: "text-green-600 bg-green-100",
  },
  {
    id: 3,
    title: "Delivery completed",
    description: "Traveler John delivered Package #PKG-987.",
    time: "35 mins ago",
    icon: Truck,
    color: "text-purple-600 bg-purple-100",
  },
  {
    id: 4,
    title: "Payment released",
    description: "$120 transferred to Traveler Wallet.",
    time: "1 hour ago",
    icon: CreditCard,
    color: "text-emerald-600 bg-emerald-100",
  },
  {
    id: 5,
    title: "KYC Approved",
    description: "Traveler Sarah's identity verification completed.",
    time: "2 hours ago",
    icon: ShieldCheck,
    color: "text-indigo-600 bg-indigo-100",
  },
  {
    id: 6,
    title: "Dispute Opened",
    description: "Dispute #DSP-19 created for Booking #BK-287.",
    time: "4 hours ago",
    icon: AlertTriangle,
    color: "text-red-600 bg-red-100",
  },
];

export default function RecentActivities() {
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

      <div className="divide-y">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition"
            >
              <div
                className={`h-11 w-11 rounded-full flex items-center justify-center ${activity.color}`}
              >
                <Icon size={20} />
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {activity.title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {activity.description}
                </p>
              </div>

              <span className="text-xs text-gray-400 whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
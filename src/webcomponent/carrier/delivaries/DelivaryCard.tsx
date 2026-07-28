"use client";

import { BookingData } from "@/api/booking.api";

import { CalendarDays, Package, ArrowRight, StickyNote } from "lucide-react";
import { statusStyles } from "@/lib/statusColor";

interface DeliveryCardProps {
  data: BookingData;
}

// Safe default style if statusStyles doesn't match
const DEFAULT_STYLE = {
  label: "Pending",
  bg: "bg-amber-50",
  text: "text-amber-700",
  border: "border-amber-200",
};

export const DeliveryCard = ({ data }: DeliveryCardProps) => {
  const {
    tracking_number,
    package_title,
    sender_name,
    status,
    route,
    agreed_weight_kg,
    agreed_reward,
    currency,
    created_at,
  } = data;

  // Guarantee currentStyle is never undefined
  const currentStyle =
    (status && statusStyles ? statusStyles[status] : null) ||
    statusStyles?.PENDING ||
    DEFAULT_STYLE;

  const formattedDate = new Date(created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Sender & Route Information */}
      <div className="flex items-start gap-2">
        <div className="p-2 rounded-full bg-[#FEB42333] shrink-0">
          <StickyNote className="text-[#FEB423] w-4 h-4" />
        </div>
        <div className="flex flex-col gap-1 w-full">
          <div className="flex justify-between items-start gap-2">
            <div>
              <span className="text-xs font-mono text-gray-400">
                {tracking_number}
              </span>
              <h3 className="font-semibold text-base text-gray-900 leading-snug">
                {package_title}
              </h3>
            </div>
            <div
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}
            >
              {currentStyle.label || status}
            </div>
          </div>

          <p className="text-xs text-gray-500">Sender: {sender_name}</p>

          <div className="flex items-center text-gray-700 text-sm gap-2 mt-1">
            <span>
              {route?.from_city}, {route?.from_country}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              {route?.to_city}, {route?.to_country}
            </span>
          </div>
        </div>
      </div>

      {/* Package Specs & Reward */}
      <div className="flex justify-between items-center mt-1 text-sm text-gray-700 px-2 pt-2 border-t">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Package className="w-3.5 h-3.5 text-gray-400" />
            <span>{agreed_weight_kg} kg</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
        <div className="text-emerald-600 font-bold text-base">
          {currency} ${agreed_reward}
        </div>
      </div>
    </div>
  );
};
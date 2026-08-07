import React from "react";
import { DisputeStatusType } from "@/api/adminDisputes.api";

const STATUS_CONFIG: Record<
  DisputeStatusType,
  { label: string; dot: string; bg: string; text: string }
> = {
  OPEN: {
    label: "Open",
    dot: "🔴",
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    dot: "🟡",
    bg: "bg-yellow-50 border-yellow-200",
    text: "text-yellow-700",
  },
  WAITING_FOR_USER: {
    label: "Waiting User",
    dot: "🟠",
    bg: "bg-orange-50 border-orange-200",
    text: "text-orange-700",
  },
  RESOLVED: {
    label: "Resolved",
    dot: "🟢",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
  },
  REJECTED: {
    label: "Rejected",
    dot: "⚫",
    bg: "bg-gray-100 border-gray-300",
    text: "text-gray-700",
  },
  CLOSED: {
    label: "Closed",
    dot: "🔵",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
  },
};

export const StatusBadge: React.FC<{ status: DisputeStatusType }> = ({
  status,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text}`}
    >
      <span>{config.dot}</span>
      <span>{config.label}</span>
    </span>
  );
};
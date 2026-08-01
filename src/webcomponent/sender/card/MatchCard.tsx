"use client";

import React from "react";
import Image from "next/image";
import { MatchItem } from "@/api/matching.api";
import { Calendar, Briefcase, CircleDollarSign, Star, Package, ArrowRight, Loader2 } from "lucide-react";

interface MatchCardProps {
  match: MatchItem;
  isSubmitting?: boolean;
  onViewTrip: (match: MatchItem) => void;
  onSendBooking: (match: MatchItem) => void;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  AVAILABLE: { label: "Available", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  REQUESTED: { label: "Requested", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  ACCEPTED: { label: "Accepted", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  REJECTED: { label: "Rejected", bg: "bg-red-50 border-red-200", text: "text-red-700", dot: "bg-red-500" },
  EXPIRED: { label: "Expired", bg: "bg-slate-100 border-slate-300", text: "text-slate-600", dot: "bg-slate-400" },
};

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isSubmitting = false,
  onViewTrip,
  onSendBooking,
}) => {
  const status = statusConfig[match.status] || statusConfig.AVAILABLE;
  const matchScore = Math.round(parseFloat(match.score || "0"));

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Section */}
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700">
            <span>🎯</span>
            <span>{matchScore}% Match</span>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${status.bg} ${status.text}`}>
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            <span>{status.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
            <Package className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
            {match.package_title}
          </h3>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
          <span>{match.package_pickup_city}, {match.package_pickup_country}</span>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-1" />
          <span>{match.package_destination_city}, {match.package_destination_country}</span>
        </div>
      </div>

      <div className="w-full border-t border-slate-100" />

      {/* Middle Traveler Section */}
      <div className="p-4 sm:p-5 flex flex-col gap-3.5 bg-slate-50/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {match.traveler_avatar ? (
              <Image
                src={match.traveler_avatar}
                alt={match.traveler_name}
                width={36}
                height={36}
                className="rounded-full object-cover w-9 h-9 border border-slate-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                {match.traveler_name?.charAt(0)}
              </div>
            )}
            <span className="font-bold text-sm text-slate-900 line-clamp-1">
              👤 {match.traveler_name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-800 shrink-0">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{parseFloat(match.traveler_rating || "0").toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({match.total_reviews})</span>
          </div>
        </div>

        <div className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <span>✈️</span>
          <span>{match.trip_title}</span>
        </div>

        <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>
            {formatDate(match.departure_date)} → {formatDate(match.arrival_date)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium pt-1">
          <div className="flex items-center gap-1.5 text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80">
            <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate">Capacity: <strong className="text-slate-900">{match.remaining_weight} kg</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80">
            <CircleDollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Reward: <strong className="text-emerald-700">${parseFloat(match.reward_per_kg || "0").toFixed(0)} / kg</strong></span>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-slate-100" />

      {/* Action Footer */}
      <div className="p-4 flex items-center gap-3">
        <button
        onClick={() => onViewTrip(match)}
        className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 transition cursor-pointer"
        >
        View Trip
        </button>
        <button
        onClick={() => onSendBooking(match)}
        disabled={match.status !== "AVAILABLE" || isSubmitting}
        className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            match.status === "AVAILABLE" && !isSubmitting
            ? "bg-amber-400 hover:bg-amber-500 text-white active:scale-98 shadow-xs"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
        >
        {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : match.status === "AVAILABLE" ? (
            "Send Booking Request"
        ) : (
            "Request Sent"
        )}
        </button>
      </div>
    </div>
  );
};
"use client";

import React from "react";
import Image from "next/image";
import { MatchItem } from "@/api/matching.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, MapPin, Calendar, Briefcase, DollarSign, Package, User, CheckCircle2, Loader2 } from "lucide-react";

interface MatchDetailModalProps {
  isOpen: boolean;
  match: MatchItem | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSendBooking: (match: MatchItem) => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  isOpen,
  match,
  isSubmitting = false,
  onClose,
  onSendBooking,
}) => {
  if (!match) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Trip & Match Details
          </span>
          <DialogTitle className="text-xl font-extrabold text-slate-900 mt-0.5">
            {match.trip_title}
          </DialogTitle>
        </DialogHeader>

        {/* Modal Body */}
        <div className="space-y-5 py-2">
          {/* Match Score Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-medium text-emerald-100">Algorithmic Match Score</p>
              <h3 className="text-2xl font-black">{Math.round(parseFloat(match.score || "0"))}% Compatible</h3>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Traveler Profile */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" /> Traveler Profile
            </h4>
            <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {match.traveler_avatar ? (
                  <Image
                    src={match.traveler_avatar}
                    alt={match.traveler_name}
                    width={44}
                    height={44}
                    className="rounded-full object-cover border border-slate-300 w-11 h-11"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base">
                    {match.traveler_name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">{match.traveler_name}</h5>
                  <p className="text-xs text-slate-500">{match.traveler}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-sm font-extrabold text-slate-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{parseFloat(match.traveler_rating || "0").toFixed(1)}</span>
                </div>
                <span className="text-xs text-slate-400">{match.total_reviews} reviews</span>
              </div>
            </div>
          </div>

          {/* Travel Route */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" /> Travel Route
            </h4>
            <div className="grid grid-cols-2 gap-3 p-3.5 border border-slate-200 rounded-xl bg-white">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Departure</span>
                <span className="text-sm font-bold text-slate-900">{match.traveler_from_city}</span>
                <span className="text-xs text-slate-500 block">{match.traveler_from_country}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Destination</span>
                <span className="text-sm font-bold text-slate-900">{match.traveler_to_city}</span>
                <span className="text-xs text-slate-500 block">{match.traveler_to_country}</span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Departure Date
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">{match.departure_date}</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Arrival Date
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">{match.arrival_date}</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Available Capacity
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">{match.remaining_weight} kg</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Reward / kg
              </span>
              <p className="text-sm font-bold text-emerald-700 mt-1">${match.reward_per_kg} {match.currency}</p>
            </div>
          </div>

          {/* Matched Package */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-slate-400" /> Matched Package
            </h4>
            <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center gap-3">
              {match.package_image && (
                <Image
                  src={match.package_image}
                  alt={match.package_title}
                  width={44}
                  height={44}
                  className="rounded-lg object-cover w-11 h-11 border border-slate-200"
                />
              )}
              <div>
                <h5 className="font-bold text-slate-900 text-sm">{match.package_title}</h5>
                <p className="text-xs text-slate-500">{match.package_pickup_city} → {match.package_destination_city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onSendBooking(match);
            }}
            disabled={match.status !== "AVAILABLE" || isSubmitting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {match.status === "AVAILABLE" ? "Send Booking Request" : "Request Sent"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
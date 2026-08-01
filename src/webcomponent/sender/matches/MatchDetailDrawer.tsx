"use client";

import React from "react";
import Image from "next/image";
import { MatchItem } from "@/api/matching.api";
import { X, Star, MapPin, Calendar, Weight, DollarSign, Package, User, CheckCircle2 } from "lucide-react";

interface MatchDetailDrawerProps {
  isOpen: boolean;
  match: MatchItem | null;
  onClose: () => void;
  onSendBooking: (match: MatchItem) => void;
}

export const MatchDetailDrawer: React.FC<MatchDetailDrawerProps> = ({
  isOpen,
  match,
  onClose,
  onSendBooking,
}) => {
  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto antialiased animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Trip & Match Details</span>
            <h2 className="text-lg font-extrabold text-slate-900">{match.trip_title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Match Score Card */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-medium text-emerald-100">Algorithmic Match Score</p>
              <h3 className="text-2xl font-black">{Math.round(parseFloat(match.score))}% Compatible</h3>
            </div>
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Traveler Info Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" /> Traveler Profile
            </h4>
            <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {match.traveler_avatar ? (
                  <Image
                    src={match.traveler_avatar}
                    alt={match.traveler_name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg">
                    {match.traveler_name.charAt(0)}
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
                  <span>{parseFloat(match.traveler_rating).toFixed(1)}</span>
                </div>
                <span className="text-xs text-slate-400">{match.total_reviews} reviews</span>
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" /> Travel Route
            </h4>
            <div className="grid grid-cols-2 gap-3 p-4 border border-slate-200 rounded-2xl bg-white">
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

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Departure Date
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">{match.departure_date}</p>
            </div>
            <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Arrival Date
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">{match.arrival_date}</p>
            </div>
            <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Weight className="w-3.5 h-3.5 text-slate-500" /> Available Capacity
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">{match.remaining_weight} kg</p>
            </div>
            <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Reward / kg
              </span>
              <p className="text-sm font-bold text-emerald-700 mt-1">${match.reward_per_kg} {match.currency}</p>
            </div>
          </div>

          {/* Package Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-slate-400" /> Matched Package
            </h4>
            <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 flex items-center gap-3">
              {match.package_image && (
                <Image
                  src={match.package_image}
                  alt={match.package_title}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover w-12 h-12 border border-slate-200"
                />
              )}
              <div>
                <h5 className="font-bold text-slate-900 text-sm">{match.package_title}</h5>
                <p className="text-xs text-slate-500">{match.package_pickup_city} → {match.package_destination_city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Sticky Footer */}
        <div className="p-5 border-t border-slate-200 sticky bottom-0 bg-white">
          <button
            onClick={() => {
              onClose();
              onSendBooking(match);
            }}
            disabled={match.status !== "AVAILABLE"}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition shadow-sm cursor-pointer"
          >
            Send Booking Request Now
          </button>
        </div>
      </div>
    </div>
  );
};
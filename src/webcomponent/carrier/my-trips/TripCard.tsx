"use client";

import { ArrowRight, Calendar, Scale, Edit2, Eye, DollarSign } from "lucide-react";
import { BackendTrip } from "@/api/trip.api";
import { format } from "date-fns";

interface TripCardProps {
  trip: BackendTrip;
  onEditClick: (trip: BackendTrip) => void;
  onViewClick: (tripId: string) => void;
}

export const TripCard = ({ trip, onEditClick, onViewClick }: TripCardProps) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return format(new Date(dateStr), "dd MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 gap-4 group text-slate-800">
      <div className="flex justify-between items-start">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
          <span className="text-xl leading-none">✈️</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-semibold">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          {trip.status}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1 line-clamp-1">
          {trip.title}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 tracking-tight">{trip.from_city}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
          <span className="text-sm font-bold text-slate-900 tracking-tight">{trip.to_city}</span>
        </div>
        <p className="text-[11px] text-slate-400">
          {trip.from_country} &rarr; {trip.to_country}
        </p>
      </div>

      <hr className="border-slate-100" />

      <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2 col-span-2 text-slate-600 font-semibold mb-1">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{formatDate(trip.departure_date)} - {formatDate(trip.arrival_date)}</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
          <Scale className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-tight">Available</p>
            <p className="text-slate-700 font-bold">{trip.available_weight_kg} / {trip.max_weight_kg} kg</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
          <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-tight">Reward/kg</p>
            <p className="text-slate-700 font-bold">${trip.reward_per_kg} {trip.currency}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/70 mt-1">
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          <span className="font-semibold text-slate-700">Memo:</span> {trip.description || "No description provided."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onViewClick(trip.id)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all border border-slate-200"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        <button
          onClick={() => onEditClick(trip)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
    </div>
  );
};
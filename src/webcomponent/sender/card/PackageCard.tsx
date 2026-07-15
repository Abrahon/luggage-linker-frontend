import React from "react";
import { getStatusConfig } from "../../../lib/statusHelper";


interface PackageProps {
  packageItem: {
    id: string;
    image: string;
    title: string;
    category: string;
    reward: number;
    weight: number;
    declaredValue: number;
    pickup: string;
    destination: string;
    status: string;
    isVerified: boolean;
    risk: string;
  };
  onDeleteRequest: (id: string) => void;
}

export const PackageCard: React.FC<PackageProps> = ({ packageItem, onDeleteRequest }) => {
  const statusConfig = getStatusConfig(packageItem.status);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      
      {/* Top Cover Details */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex gap-4 items-start">
          <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {packageItem.image ? (
              <img src={packageItem.image} alt={packageItem.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">📦</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate">{packageItem.title}</h3>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
              {packageItem.category}
            </span>
          </div>
        </div>
      </div>

      {/* Numeric Metadata Row */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/50 py-3 border-b border-slate-100 text-center">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reward</p>
          <p className="text-sm font-extrabold text-blue-600 mt-0.5">${packageItem.reward}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Weight</p>
          <p className="text-sm font-extrabold text-slate-800 mt-0.5">{packageItem.weight} KG</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Value</p>
          <p className="text-sm font-extrabold text-slate-800 mt-0.5">${packageItem.declaredValue}</p>
        </div>
      </div>

      {/* Route Journey Path */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col gap-1 text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 text-xs">📍</span>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Pickup:</span>
          <span className="text-slate-900 ml-auto">{packageItem.pickup}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-blue-500 text-xs">📍</span>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">Destination:</span>
          <span className="text-slate-900 ml-auto">{packageItem.destination}</span>
        </div>
      </div>

      {/* Security Check & Internal Tags */}
      <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-3 gap-2 items-center">
        <div className="text-center">
          <p className="text-[9px] uppercase font-bold text-slate-400">Status</p>
          <span className={`inline-flex items-center justify-center w-full px-2 py-1 rounded-md text-[10px] font-bold border mt-1 ${statusConfig.color}`}>
            {statusConfig.text}
          </span>
        </div>
        <div className="text-center">
          <p className="text-[9px] uppercase font-bold text-slate-400">Verified</p>
          <span className={`inline-flex items-center justify-center w-full px-2 py-1 rounded-md text-[10px] font-bold mt-1 ${packageItem.isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
            {packageItem.isVerified ? "Verified" : "Pending"}
          </span>
        </div>
        <div className="text-center">
          <p className="text-[9px] uppercase font-bold text-slate-400">Risk</p>
          <span className={`inline-flex items-center justify-center w-full px-2 py-1 rounded-md text-[10px] font-bold mt-1 ${packageItem.risk === "Low" ? "bg-emerald-50 text-emerald-700" : packageItem.risk === "Medium" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
            {packageItem.risk}
          </span>
        </div>
      </div>

      {/* Card Action Button Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 text-sm">
        <button className="py-3 font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100/50 transition-all">
          👁 View
        </button>
        <button className="py-3 font-semibold text-slate-600 hover:text-amber-600 hover:bg-slate-100/50 transition-all">
          ✏ Edit
        </button>
        <button 
          onClick={() => onDeleteRequest(packageItem.id)}
          className="py-3 font-semibold text-rose-600 hover:bg-rose-50 transition-all"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
};
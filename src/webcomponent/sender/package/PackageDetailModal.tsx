"use client";

import React from "react";

interface PackageDetailModalProps {
  isOpen: boolean;
  packageData: any;
  onClose: () => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  isOpen,
  packageData,
  onClose,
}) => {
  if (!isOpen || !packageData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl border border-slate-200 z-10 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">
              {packageData.category}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {packageData.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1"
          >
            ✕
          </button>
        </div>

        <p className="text-slate-600 text-xs sm:text-sm">
          {packageData.description || "No description provided."}
        </p>

        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Reward</p>
            <p className="text-base font-extrabold text-blue-600 mt-0.5">
              ${packageData.reward_amount}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Weight</p>
            <p className="text-base font-extrabold text-slate-800 mt-0.5">
              {packageData.weight} KG
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Value</p>
            <p className="text-base font-extrabold text-slate-800 mt-0.5">
              ${packageData.declared_value}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Pickup Location</span>
            <span className="font-bold text-slate-800">📍 {packageData.pickup_city}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Destination</span>
            <span className="font-bold text-slate-800">📍 {packageData.destination_city}</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
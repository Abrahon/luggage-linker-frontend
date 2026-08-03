"use client";

import React from "react";
import { Plus, Package } from "lucide-react";

interface EmptyStateProps {
  onCreate?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreate }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-16 px-4 bg-white border border-slate-200 rounded-2xl shadow-2xs my-4">
      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-3 text-slate-400">
        <Package className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900">No Packages Found</h3>
      <p className="text-slate-500 text-xs sm:text-sm max-w-sm mt-1">
        Create your first package listing to start matching with verified international travelers.
      </p>
      {onCreate && (
        <button
          onClick={onCreate}
          className="mt-5 w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create Package
        </button>
      )}
    </div>
  );
};
import React from "react";

export const EmptyState = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-12 px-4 bg-white border border-slate-200 rounded-2xl shadow-2xs my-4">
      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-3 text-2xl">
        📦
      </div>
      <h3 className="text-base font-bold text-slate-900">No Packages Found</h3>
      <p className="text-slate-500 text-xs sm:text-sm max-w-sm mt-1">
        Create your first package listing to start matching with verified international travelers.
      </p>
      <button className="mt-5 w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-2xs transition-all cursor-pointer">
        Create Package
      </button>
    </div>
  );
};
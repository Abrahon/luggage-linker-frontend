import React from "react";

export const EmptyState = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-16 px-4 bg-white border border-slate-150 rounded-2xl shadow-sm my-4">
      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner mb-4 text-3xl">
        📦
      </div>
      <h3 className="text-lg font-bold text-slate-900">No Packages Yet</h3>
      <p className="text-slate-500 text-sm max-w-sm mt-1">
        Create your first package listing and start matching with active verified international travelers.
      </p>
      <button className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all hover:shadow">
        Create Package
      </button>
    </div>
  );
};
import { ArrowRight, Calendar, Scale, Clipboard, AlertCircle, Eye, Edit2 } from "lucide-react";
import { TripDetails } from "@/interface/Trip";

// Extend props slightly so the card can notify the parent component to open the edit modal
interface ExtendedTripCardProps extends TripDetails {
  onEditClick?: (trip: TripDetails) => void;
  onViewClick?: (tripId: number) => void;
}

export const TripCard = ({ 
  tripId = 0, // 👈
  from, 
  to, 
  date, 
  carryWeight, 
  note,
  onEditClick,
  onViewClick 
}: ExtendedTripCardProps) => {

  // Default handler if parent actions aren't passed yet
  const handleView = () => {
    if (onViewClick) {
      onViewClick(tripId);
    } else {
      alert(`Opening profile track details for Trip #TRP-102${tripId}`);
    }
  };

  const handleEdit = () => {
    if (onEditClick) {
      onEditClick({ tripId, from, to, date, carryWeight, note });
    } else {
      alert(`Editing configuration parameters for Trip #TRP-102${tripId}`);
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 gap-4 group text-slate-800">
      
      {/* 1️⃣ Header Row */}
      <div className="flex justify-between items-start">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
          <span className="text-xl leading-none">✈️</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-semibold">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Active
        </div>
      </div>

      {/* 2️⃣ Route Tracker */}
      <div>
        <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">
          Trip #TRP-102{tripId}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-slate-900 tracking-tight">{from}</span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          <span className="text-base font-bold text-slate-900 tracking-tight">{to}</span>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* 3️⃣ Metagrid Stats */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2 col-span-2 text-slate-600 font-semibold mb-1">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>{typeof date === "string" ? date : "Date Pending"}</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
          <Scale className="w-3.5 h-3.5 text-indigo-500" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-tight">Capacity</p>
            <p className="text-slate-700 font-bold">{carryWeight || 15} kg</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
          <Clipboard className="w-3.5 h-3.5 text-amber-500" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-tight">Requests</p>
            <p className="text-slate-700 font-bold">4</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
          <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-tight">Matched</p>
            <p className="text-slate-700 font-bold">2</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
          <span className="text-sm">📖</span>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-tight">Bookings</p>
            <p className="text-slate-700 font-bold">1</p>
          </div>
        </div>
      </div>

      {/* 4️⃣ Notes Memo */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/70 mt-1">
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          <span className="font-semibold text-slate-700">Memo:</span> {note || "No specified notes."}
        </p>
      </div>

      {/* 5️⃣ Action Tray Buttons with Working Click Triggers */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
        <button 
          onClick={handleView}
          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200"
        >
          <Eye className="w-3.5 h-3.5" />
          View Details
        </button>
        <button 
          onClick={handleEdit}
          className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
      
    </div>
  );
};
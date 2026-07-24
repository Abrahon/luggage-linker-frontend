import React from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Dimmed Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          ⚠️ Delete Package?
        </h3>
        <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
          This action cannot be undone. All listings, data, and active traveler matches associated with this item will be permanently removed.
        </p>
        <div className="w-full flex flex-col sm:flex-row gap-2.5 justify-end mt-6">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
import React from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center px-4">
      {/* Dimmed Overlay */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          ⚠️ Delete Package?
        </h3>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
          This action cannot be undone. All listings, data, matches, and transit status files linked to this specific item will be permanently removed.
        </p>
        <div className="flex gap-3 justify-end mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
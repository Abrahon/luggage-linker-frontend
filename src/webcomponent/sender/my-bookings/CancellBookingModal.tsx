"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

interface CancelBookingModalProps {
  isOpen: boolean;
  packageTitle: string;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  packageTitle,
  isSubmitting = false,
  onClose,
  onConfirmCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl p-6 text-center text-slate-800">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900 text-center">
            Are you sure you want to cancel booking?
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          You are about to cancel <strong className="text-slate-800">&quot;{packageTitle}&quot;</strong>. This action cannot be reversed.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirmCancel}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-white" />}
            <span>Yes</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
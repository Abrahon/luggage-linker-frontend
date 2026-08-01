"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MyBookingItem } from "@/api/booking.api";
import { Clock, Ban, User, Calendar, CircleDollarSign } from "lucide-react";
import { CancelBookingModal } from "../my-bookings/CancellBookingModal";


interface MyBookingCardProps {
  booking: MyBookingItem;
  onOpenTimeline: (booking: MyBookingItem) => void;
  onCancelBooking: (bookingId: string) => Promise<void>;
}

export const MyBookingCard: React.FC<MyBookingCardProps> = ({
  booking,
  onOpenTimeline,
  onCancelBooking,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleConfirmCancel = async () => {
    try {
      setIsCancelling(true);
      await onCancelBooking(booking.id);
      setShowCancelModal(false);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden">
        {/* Card Header & Status */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
              {booking.tracking_number}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {booking.status.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {booking.package_image ? (
              <Image
                src={booking.package_image}
                alt={booking.package_title}
                width={48}
                height={48}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 font-black flex items-center justify-center text-lg shrink-0">
                📦
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg line-clamp-1">
                {booking.package_title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">{booking.trip_title}</p>
            </div>
          </div>
        </div>

        {/* Traveler & Reward Grid */}
        <div className="p-4 sm:p-5 bg-slate-50/50 space-y-2.5 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" /> Traveler:
            </span>
            <span className="font-bold text-slate-900">{booking.traveler_name}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500 flex items-center gap-1">
              <CircleDollarSign className="w-3.5 h-3.5 text-slate-400" /> Reward:
            </span>
            <span className="font-extrabold text-emerald-600">${booking.agreed_reward} {booking.currency}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Created:
            </span>
            <span className="font-medium text-slate-700">{booking.created_date}</span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenTimeline(booking)}
            className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Timeline</span>
          </button>

          {booking.can_cancel && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-xs sm:text-sm font-semibold text-red-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Ban className="w-4 h-4 text-red-600" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      <CancelBookingModal
        isOpen={showCancelModal}
        packageTitle={booking.package_title}
        isSubmitting={isCancelling}
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={handleConfirmCancel}
      />
    </>
  );
};
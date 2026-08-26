"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MyBookingItem, TimelineStep, getBookingTimeline } from "@/api/booking.api";
import { CheckCircle2, Circle, Clock, MessageSquare, Loader2, MapPin, Package, CreditCard, User } from "lucide-react";
import { toast } from "sonner";

interface BookingTimelineModalProps {
  isOpen: boolean;
  booking: MyBookingItem | null;
  onClose: () => void;
  onOpenChat?: (booking: MyBookingItem) => void;
}

export const BookingTimelineModal: React.FC<BookingTimelineModalProps> = ({
  isOpen,
  booking,
  onClose,
  onOpenChat,
}) => {
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && booking?.id) {
      const fetchTimeline = async () => {
        try {
          setLoading(true);
          const res = await getBookingTimeline(booking.id);
          if (res.success && res.data) {
            setTimeline(res.data.timeline || []);
          }
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Failed to load booking timeline.");
        } finally {
          setLoading(false);
        }
      };
      fetchTimeline();
    }
  }, [isOpen, booking]);

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 text-slate-800">
        {/* Header */}
        <DialogHeader className="pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            Booking Details
          </span>
          <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            📦 {booking.package_title}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-500 font-medium">Tracking:</span>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
              {booking.tracking_number}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Status Banner */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Status</p>
              <h4 className="text-base font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                {booking.status.replace("_", " ")}
              </h4>
            </div>
            <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10 text-xs font-semibold text-white">
              Step {booking.current_step} of 8
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" /> Timeline
            </h4>

            {loading ? (
              <div className="py-8 flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                <span className="text-xs font-medium">Loading timeline...</span>
              </div>
            ) : timeline.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No timeline entries found.</p>
            ) : (
              <div className="relative pl-6 space-y-3.5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                {timeline.map((step, idx) => {
                  const isCurrent = step.status === booking.status;
                  return (
                    <div key={idx} className="relative flex items-start gap-3 text-xs sm:text-sm">
                      <div className="absolute -left-[23px] top-0.5 bg-white rounded-full">
                        {step.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                        ) : isCurrent ? (
                          <Circle className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 flex justify-between items-center">
                        <span className={`font-bold ${step.completed || isCurrent ? "text-slate-900" : "text-slate-400"}`}>
                          {step.title}
                        </span>
                        {step.timestamp && (
                          <span className="text-[11px] font-medium text-slate-400">
                            {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Traveler Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" /> Traveler
            </h4>
            <div className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm border border-amber-200">
                  👤
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">{booking.traveler_name}</h5>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {booking.route.from_city} ({booking.route.from_country}) → {booking.route.to_city} ({booking.route.to_country})
                  </p>
                </div>
              </div>

              {booking.can_chat && (
                <button
                  onClick={() => onOpenChat && onOpenChat(booking)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>
              )}
            </div>
          </div>

          {/* Payment & Package Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50/60 space-y-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Payment
              </h5>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Reward:</span>
                <span className="font-extrabold text-slate-900">${booking.agreed_reward} {booking.currency}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Payment:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {booking.payment_status}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Escrow:</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {booking.escrow_status}
                </span>
              </div>
            </div>

            <div className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50/60 space-y-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> Package
              </h5>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Trip Title:</span>
                <span className="font-bold text-slate-900 truncate max-w-[110px]">{booking.trip_title}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Created:</span>
                <span className="font-medium text-slate-700">{booking.created_date}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
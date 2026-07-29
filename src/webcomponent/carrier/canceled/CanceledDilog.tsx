"use client";

import Image from "next/image";
import { BookingData } from "@/api/booking.api";
import { statusStyles } from "@/lib/statusColor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  CalendarDays,
  Package,
  User,
  Mail,
  AlertTriangle,
  CreditCard,
  DollarSign,
} from "lucide-react";

interface CanceledDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  delivery: BookingData | null;
}

export const CanceledDialog = ({
  open,
  setOpen,
  delivery,
}: CanceledDialogProps) => {
  if (!delivery) return null;

  const currentStyle =
    (statusStyles && statusStyles[delivery.status]) || {
      label: "Cancelled",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    };

  const formattedDate = delivery.created_at
    ? new Date(delivery.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl font-montserrat max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center pr-6">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Canceled Booking Details
            </DialogTitle>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}
            >
              {currentStyle.label || delivery.status}
            </span>
          </div>
          <p className="text-xs font-mono text-gray-400">
            Tracking No: {delivery.tracking_number}
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">
          {/* Refusal Reason Banner (If applicable) */}
          {delivery.traveler_refusal_reason && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-800 uppercase tracking-wide">
                  Refusal Reason / Cancellation Note
                </p>
                <p className="text-sm text-red-700 mt-0.5 font-medium">
                  {delivery.traveler_refusal_reason}
                </p>
              </div>
            </div>
          )}

          {/* Main Route Header */}
          <div className="bg-gray-50 p-4 rounded-xl border flex flex-col gap-2">
            <h3 className="font-bold text-lg text-gray-900">
              {delivery.package_title}
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Trip: {delivery.trip_title}
            </p>
            <div className="flex items-center text-gray-700 text-sm gap-2 bg-white p-2.5 rounded-lg border mt-1">
              <span className="font-semibold">
                {delivery.route?.from_city}, {delivery.route?.from_country}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-semibold">
                {delivery.route?.to_city}, {delivery.route?.to_country}
              </span>
            </div>
          </div>

          {/* Package Image Preview */}
          {delivery.package_image ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                Package Photo
              </h4>
              <div className="w-full h-48 relative rounded-xl overflow-hidden border bg-gray-100">
                <Image
                  src={delivery.package_image}
                  alt={delivery.package_title || "Package Image"}
                  fill
                  className="object-cover"
                  unoptimized={delivery.package_image.includes("cloudinary.com")}
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-20 bg-gray-50 border border-dashed rounded-xl flex items-center justify-center text-xs text-gray-400">
              No photo available for this package
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <User className="w-4 h-4 text-gray-500 shrink-0" />
              <div className="truncate">
                <p className="text-xs text-gray-400">Sender</p>
                <p className="font-medium text-gray-800 truncate">
                  {delivery.sender_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <Mail className="w-4 h-4 text-gray-500 shrink-0" />
              <div className="truncate">
                <p className="text-xs text-gray-400">Sender Email</p>
                <p className="font-medium text-gray-800 truncate">
                  {delivery.sender_email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <Package className="w-4 h-4 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Agreed Weight</p>
                <p className="font-medium text-gray-800">
                  {delivery.agreed_weight_kg} kg
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <CalendarDays className="w-4 h-4 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Date Created</p>
                <p className="font-medium text-gray-800">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Payment & Financial Info */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 border rounded-xl">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Payment Status</p>
                <p className="font-semibold text-gray-800">
                  {delivery.payment_status}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Agreed Reward</p>
                <p className="font-bold text-gray-900">
                  {delivery.currency} ${delivery.agreed_reward}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CanceledDialog;
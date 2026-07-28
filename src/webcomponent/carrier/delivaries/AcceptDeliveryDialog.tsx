"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { BookingData, deliveryApi } from "@/api/booking.api";
import { statusStyles } from "@/lib/statusColor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, User, Mail, DollarSign } from "lucide-react";

interface AcceptDeliveryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  delivery: BookingData | null;
  onBookingCancelled?: (cancelledId: string) => void;
}

export const AcceptDeliveryDialog = ({
  open,
  setOpen,
  delivery,
  onBookingCancelled,
}: AcceptDeliveryDialogProps) => {
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  if (!delivery) return null;

  const currentStyle = statusStyles[delivery.status] ?? statusStyles.PENDING;

  // Statuses where cancellation is allowed
  const cancellableStatuses = [
    "PENDING",
    "TRAVELER_ACCEPTED",
    "PAYMENT_PENDING",
    "CONFIRMED",
  ];
  const canCancel = cancellableStatuses.includes(delivery.status);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking request?"))
      return;

    try {
      setIsCancelling(true);
      const response = await deliveryApi.cancelDelivery(delivery.id);

      toast.success(response.message || "Booking cancelled successfully");

      if (onBookingCancelled) {
        onBookingCancelled(delivery.id);
      }
      setOpen(false);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to cancel the booking.";
      toast.error(errorMsg);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl font-montserrat max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center pr-6">
            <DialogTitle className="text-xl font-semibold">
              Booking Details
            </DialogTitle>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}
            >
              {currentStyle.label}
            </div>
          </div>
          <p className="text-xs font-mono text-gray-400">
            Tracking: {delivery.tracking_number}
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">
          {/* Main Trip Overview */}
          <div className="bg-gray-50 p-4 rounded-xl border flex flex-col gap-3">
            <h3 className="font-bold text-lg text-gray-900">
              {delivery.package_title}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              Trip: {delivery.trip_title}
            </p>

            <div className="flex items-center text-gray-700 text-sm gap-2 bg-white p-2.5 rounded-lg border">
              <span className="font-semibold">
                {delivery.route.from_city}, {delivery.route.from_country}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-semibold">
                {delivery.route.to_city}, {delivery.route.to_country}
              </span>
            </div>
          </div>

          {/* Package Image Preview */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              Package Image
            </h4>
            {delivery.package_image ? (
              <div className="w-full h-48 relative rounded-xl overflow-hidden border">
                <Image
                  src={delivery.package_image}
                  alt={delivery.package_title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-24 bg-gray-100 rounded-xl border border-dashed flex items-center justify-center text-gray-400 text-sm">
                No image uploaded for this package
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <User className="w-4 h-4 text-gray-500 shrink-0" />
              <div className="truncate">
                <p className="text-xs text-gray-400">Sender Name</p>
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
                <p className="text-xs text-gray-400">Package Weight</p>
                <p className="font-medium text-gray-800">
                  {delivery.agreed_weight_kg} kg
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Agreed Reward</p>
                <p className="font-bold text-emerald-600">
                  {delivery.currency} ${delivery.agreed_reward}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>

          {canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
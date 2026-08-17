"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { BookingData, deliveryApi, VerifyPickupPayload } from "@/api/booking.api";
import { statusStyles } from "@/lib/statusColor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Package,
  User,
  Mail,
  DollarSign,
  Loader2,
  KeyRound,
  XCircle,
  CheckCircle2,
  Truck,
  ShieldCheck,
} from "lucide-react";

interface AcceptDeliveryDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  delivery: BookingData | null;
  onBookingUpdated?: (updatedData?: BookingData) => void;
  showCheckbox?: boolean; // <-- Added showCheckbox property
}

  export const AcceptDeliveryDialog = ({
    open,
    setOpen,
    delivery,
    onBookingUpdated,
    showCheckbox = false, // <-- Added with default value
  }: AcceptDeliveryDialogProps) => {
    // Modal Visibility States
    const [showPickupPinModal, setShowPickupPinModal] = useState<boolean>(false);
    const [showDeliveryPinModal, setShowDeliveryPinModal] = useState<boolean>(false);
    const [showRejectModal, setShowRejectModal] = useState<boolean>(false);

    // Form Input States
    const [pickupPin, setPickupPin] = useState<string[]>(Array(6).fill(""));
    const [deliveryPin, setDeliveryPin] = useState<string[]>(Array(6).fill(""));
    const [refusalReason, setRefusalReason] = useState<string>("");

    // Loading & Error States
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [modalError, setModalError] = useState<string | null>(null);

  if (!delivery) return null;

  const currentStyle = statusStyles[delivery.status] ?? statusStyles.PENDING;

  // Status flags
  const isConfirmedStatus = delivery.status === "CONFIRMED";
  const isPickedUpStatus = delivery.status === "PICKED_UP";
  const isInTransitStatus = delivery.status === "IN_TRANSIT";

  // Statuses where simple cancellation is permitted
  const defaultCancellableStatuses = [
    "PENDING",
    "TRAVELER_ACCEPTED",
    "PAYMENT_PENDING",
  ];
  const canSimpleCancel = defaultCancellableStatuses.includes(delivery.status);

  // ----------------------------------------------------------------------
  // Handlers for Generic PIN Input (6 Digits + Copy/Paste Support)
  // ----------------------------------------------------------------------
  const handlePinChange = (
    index: number,
    value: string,
    pinState: string[],
    setPinState: (pin: string[]) => void,
    inputPrefix: string
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pinState];
    newPin[index] = value.slice(-1);
    setPinState(newPin);

    if (value && index < 5) {
      const nextInput = document.getElementById(`${inputPrefix}-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    pinState: string[],
    inputPrefix: string
  ) => {
    if (e.key === "Backspace" && !pinState[index] && index > 0) {
      const prevInput = document.getElementById(`${inputPrefix}-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePinPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    setPinState: (pin: string[]) => void,
    inputPrefix: string
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setPinState(digits);
      const lastInput = document.getElementById(`${inputPrefix}-5`);
      lastInput?.focus();
    }
  };

  // ----------------------------------------------------------------------
  // 1. API Action: Verify Pickup Accept (CONFIRMED -> PICKED_UP)
  // ----------------------------------------------------------------------
  const handleConfirmPickup = async () => {
    const fullPin = pickupPin.join("");
    if (fullPin.length !== 6) {
      setModalError("Please enter a valid 6-digit Pickup PIN.");
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);

      const payload: VerifyPickupPayload = {
        booking_id: delivery.id,
        traveler_matches_listing: true,
        pickup_pin: fullPin,
      };

      const response = await deliveryApi.verifyPickup(payload);
      toast.success(response.message || "Pickup verified successfully!");

      setShowPickupPinModal(false);
      setOpen(false);
      setPickupPin(Array(6).fill(""));

      if (onBookingUpdated) onBookingUpdated();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Invalid Pickup PIN. Please try again.";
      setModalError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------
  // 2. API Action: Start Transit (PICKED_UP -> IN_TRANSIT)
  // ----------------------------------------------------------------------
  const handleStartTransit = async () => {
    try {
      setIsSubmitting(true);
      const response = await deliveryApi.startTransit({ booking_id: delivery.id });
      toast.success(
        response.message || "Transit started! Delivery OTP emailed to recipient."
      );

      setOpen(false);
      if (onBookingUpdated) onBookingUpdated();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to start transit.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------
  // 3. API Action: Verify Delivery (IN_TRANSIT -> COMPLETED)
  // ----------------------------------------------------------------------
  const handleConfirmDelivery = async () => {
    const fullPin = deliveryPin.join("");
    if (fullPin.length !== 6) {
      setModalError("Please enter a valid 6-digit Delivery PIN.");
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);

      const response = await deliveryApi.verifyDelivery({
        booking_id: delivery.id,
        delivery_pin: fullPin,
      });

      toast.success(
        response.message || "Delivery completed successfully! Funds released."
      );

      setShowDeliveryPinModal(false);
      setOpen(false);
      setDeliveryPin(Array(6).fill(""));

      if (onBookingUpdated) onBookingUpdated();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Invalid Delivery PIN. Please try again.";
      setModalError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------
  // 4. API Action: Refuse / Reject Package
  // ----------------------------------------------------------------------
  const handleConfirmReject = async () => {
    if (!refusalReason.trim()) {
      setModalError("Please state a reason for rejecting the package.");
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);

      const payload: VerifyPickupPayload = {
        booking_id: delivery.id,
        traveler_matches_listing: false,
        traveler_refusal_reason: refusalReason.trim(),
      };

      const response = await deliveryApi.verifyPickup(payload);
      toast.success(response.message || "Booking rejected and cancelled.");

      setShowRejectModal(false);
      setOpen(false);
      setRefusalReason("");

      if (onBookingUpdated) onBookingUpdated();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to reject booking.";
      setModalError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------
  // 5. API Action: Standard Cancel (PENDING / PAYMENT_PENDING)
  // ----------------------------------------------------------------------
  const handleSimpleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking request?"))
      return;

    try {
      setIsSubmitting(true);
      const response = await deliveryApi.cancelDelivery(delivery.id);
      toast.success(response.message || "Booking cancelled successfully");

      setOpen(false);
      if (onBookingUpdated) onBookingUpdated();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to cancel booking.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Primary Booking Details Modal */}
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

            {/* Status Informational Banner */}
            {isPickedUpStatus && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <Truck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <p className="font-semibold mb-0.5">Ready for Transit</p>
                  <p className="text-amber-700">
                    Package pickup has been verified. Click <strong>Start Transit</strong> when you begin your journey. The delivery PIN will be emailed to the recipient.
                  </p>
                </div>
              </div>
            )}

            {isInTransitStatus && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900">
                  <p className="font-semibold mb-0.5">Package In Transit</p>
                  <p className="text-blue-700">
                    When you arrive at the destination and hand over the package, ask the recipient for their 6-digit Delivery PIN to complete the booking and unlock your earnings.
                  </p>
                </div>
              </div>
            )}

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

          <DialogFooter className="mt-6 gap-2 flex justify-end">
            {/* Dynamic Actions based on Delivery Status */}
            {isConfirmedStatus && (
              <div className="flex w-full sm:w-auto items-center justify-end gap-3">
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto font-medium"
                  onClick={() => {
                    setModalError(null);
                    setShowRejectModal(true);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-1.5" /> Cancel / Reject
                </Button>

                <Button
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  onClick={() => {
                    setModalError(null);
                    setShowPickupPinModal(true);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Accept & Verify
                </Button>
              </div>
            )}

            {isPickedUpStatus && (
              <Button
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                disabled={isSubmitting}
                onClick={handleStartTransit}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Truck className="w-4 h-4 mr-2" />
                )}
                Start Transit
              </Button>
            )}

            {isInTransitStatus && (
              <Button
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                onClick={() => {
                  setModalError(null);
                  setShowDeliveryPinModal(true);
                }}
              >
                <ShieldCheck className="w-4 h-4 mr-2" /> Complete Delivery
              </Button>
            )}

            {!isConfirmedStatus && !isPickedUpStatus && !isInTransitStatus && (
              <>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>

                {canSimpleCancel && (
                  <Button
                    variant="destructive"
                    onClick={handleSimpleCancel}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Cancelling..." : "Cancel Booking"}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------------------------------------------------------------- */}
      {/* 1. PICKUP PIN DIALOG (CONFIRMED -> PICKED_UP)                          */}
      {/* ---------------------------------------------------------------------- */}
      <Dialog open={showPickupPinModal} onOpenChange={setShowPickupPinModal}>
        <DialogContent className="max-w-md font-montserrat">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <KeyRound className="w-5 h-5 text-emerald-600" /> Pickup Verification
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Ask the sender for their 6-digit Pickup Verification PIN to complete handoff.
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
              {modalError}
            </div>
          )}

          <div className="py-4 flex flex-col items-center gap-3">
            <label className="text-xs font-semibold text-gray-700">
              Enter 6-Digit Pickup PIN
            </label>

            <div className="flex gap-2 justify-center my-1">
              {pickupPin.map((digit, idx) => (
                <input
                  key={idx}
                  id={`pickup-pin-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handlePinChange(
                      idx,
                      e.target.value,
                      pickupPin,
                      setPickupPin,
                      "pickup-pin-input"
                    )
                  }
                  onKeyDown={(e) =>
                    handlePinKeyDown(
                      idx,
                      e,
                      pickupPin,
                      "pickup-pin-input"
                    )
                  }
                  onPaste={(e) =>
                    handlePinPaste(e, setPickupPin, "pickup-pin-input")
                  }
                  className="w-11 h-12 text-center text-xl font-mono font-bold border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-gray-50 focus:bg-white transition-all"
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-400">
              Copy-paste is supported for 6-digit PIN code.
            </p>
          </div>

          <DialogFooter className="gap-2 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowPickupPinModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              disabled={isSubmitting}
              onClick={handleConfirmPickup}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirm Pickup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. DELIVERY PIN DIALOG (IN_TRANSIT -> COMPLETED)                       */}
      {/* ---------------------------------------------------------------------- */}
      <Dialog open={showDeliveryPinModal} onOpenChange={setShowDeliveryPinModal}>
        <DialogContent className="max-w-md font-montserrat">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Delivery Verification
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Ask the recipient for their 6-digit Delivery Verification PIN to finish delivery.
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
              {modalError}
            </div>
          )}

          <div className="py-4 flex flex-col items-center gap-3">
            <label className="text-xs font-semibold text-gray-700">
              Enter 6-Digit Delivery PIN
            </label>

            <div className="flex gap-2 justify-center my-1">
              {deliveryPin.map((digit, idx) => (
                <input
                  key={idx}
                  id={`delivery-pin-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handlePinChange(
                      idx,
                      e.target.value,
                      deliveryPin,
                      setDeliveryPin,
                      "delivery-pin-input"
                    )
                  }
                  onKeyDown={(e) =>
                    handlePinKeyDown(
                      idx,
                      e,
                      deliveryPin,
                      "delivery-pin-input"
                    )
                  }
                  onPaste={(e) =>
                    handlePinPaste(e, setDeliveryPin, "delivery-pin-input")
                  }
                  className="w-11 h-12 text-center text-xl font-mono font-bold border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-gray-50 focus:bg-white transition-all"
                />
              ))}
            </div>
            <p className="text-[11px] text-gray-400">
              Copy-paste is supported for 6-digit PIN code.
            </p>
          </div>

          <DialogFooter className="gap-2 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeliveryPinModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              disabled={isSubmitting}
              onClick={handleConfirmDelivery}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Authenticate & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. REJECT DIALOG                                                        */}
      {/* ---------------------------------------------------------------------- */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md font-montserrat">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-red-600">
              <XCircle className="w-5 h-5" /> Reject Booking
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              State the reason why the package does not match the listing.
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
              {modalError}
            </div>
          )}

          <div className="py-2">
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Reason for Refusal
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Not same product like the pictures."
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              className="w-full text-xs p-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none bg-gray-50 focus:bg-white resize-none"
            />
          </div>

          <DialogFooter className="gap-2 flex justify-end">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Back
            </Button>
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={handleConfirmReject}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
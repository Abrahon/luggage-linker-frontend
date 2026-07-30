"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  deliveryApi, 
  BookingData, 
  VerifyPickupPayload, 
  VerifyDeliveryPayload 
} from "@/api/booking.api";
import { statusStyles } from "@/lib/statusColor";
import { 
  Package, 
  User, 
  ArrowRight, 
  Weight, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Truck, 
  ArrowLeft,
  KeyRound,
  AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Progress Timeline Steps Breakdown
const TIMELINE_STEPS = [
  { key: "PAYMENT_PENDING", label: "Payment Completed" },
  { key: "CONFIRMED", label: "Pickup Verification" },
  { key: "PICKED_UP", label: "Package Picked Up" },
  { key: "IN_TRANSIT", label: "Package In Transit" },
  { key: "COMPLETED", label: "Delivery Completed" },
];

export default function BookingJourneyPage({ 
  params 
}: { 
  params: Promise<{ bookingId: string }> 
}) {
  const { bookingId } = use(params);
  const router = useRouter();

  // Booking Data States
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal Interactive States
  const [pickupModalOpen, setPickupModalOpen] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState<boolean>(false);

  // Form Field States
  const [pickupPin, setPickupPin] = useState<string>("");
  const [deliveryPin, setDeliveryPin] = useState<string>("");
  const [refusalReason, setRefusalReason] = useState<string>("");

  // Submitting States & Modal Specific Errors
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch Booking Details
  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const data = await deliveryApi.getDeliveryById(bookingId);
      setBooking(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  // Handle Verify Pickup API Action
  const handleVerifyPickup = async () => {
    if (!pickupPin.trim()) {
      setModalError("Please enter the 6-digit Pickup PIN.");
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);

      const payload: VerifyPickupPayload = {
        booking_id: bookingId,
        traveler_matches_listing: true,
        pickup_pin: pickupPin.trim(),
      };

      const res = await deliveryApi.verifyPickup(payload);
      toast.success(res.message || "Pickup verified successfully!");
      setPickupModalOpen(false);
      setPickupPin("");
      await fetchBookingDetails();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Invalid Pickup PIN.";
      setModalError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reject Package API Action
  const handleRejectPackage = async () => {
    if (!refusalReason.trim()) {
      setModalError("Please specify a refusal reason.");
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);

      const payload: VerifyPickupPayload = {
        booking_id: bookingId,
        traveler_matches_listing: false,
        traveler_refusal_reason: refusalReason.trim(),
      };

      const res = await deliveryApi.verifyPickup(payload);
      toast.success(res.message || "Package rejected and booking cancelled.");
      setRejectModalOpen(false);
      setRefusalReason("");
      await fetchBookingDetails();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to reject package.";
      setModalError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Start Transit Action
  const handleStartTransit = async () => {
    try {
      setSubmitting(true);
      const res = await deliveryApi.startTransit({ booking_id: bookingId });
      toast.success(res.message || "Transit started!");
      await fetchBookingDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to start transit.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Verify Delivery API Action
  const handleVerifyDelivery = async () => {
    if (!deliveryPin.trim()) {
      setModalError("Please enter the 6-digit Delivery PIN.");
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);

      const payload: VerifyDeliveryPayload = {
        booking_id: bookingId,
        delivery_pin: deliveryPin.trim(),
      };

      const res = await deliveryApi.verifyDelivery(payload);
      toast.success(res.message || "Delivery authenticated successfully!");
      setDeliveryModalOpen(false);
      setDeliveryPin("");
      await fetchBookingDetails();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Invalid Delivery PIN.";
      setModalError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading booking workflow...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto my-16 p-6 text-center bg-white border border-gray-200 rounded-2xl shadow-sm">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Booking Not Found</h2>
        <p className="text-sm text-gray-500 mt-1">We couldn't retrieve the requested booking record.</p>
        <Link href="/deliveries">
          <Button className="mt-4" variant="outline">Back to My Deliveries</Button>
        </Link>
      </div>
    );
  }

  const normalizedStatus = (booking.status || "PAYMENT_PENDING").toUpperCase();
  const currentStyle = statusStyles[normalizedStatus] || statusStyles.PENDING;

  // Compute Active Step Index in Timeline
  const getActiveStepIndex = () => {
    switch (normalizedStatus) {
      case "PAYMENT_PENDING": return 0;
      case "CONFIRMED": return 1;
      case "PICKED_UP": return 2;
      case "IN_TRANSIT": return 3;
      case "COMPLETED":
      case "DELIVERED": return 4;
      default: return 0;
    }
  };

  const activeIndex = getActiveStepIndex();
  const isCancelled = normalizedStatus === "CANCELLED" || normalizedStatus === "EXPIRED";

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 flex flex-col gap-8">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b pb-4">
        <Link href="/deliveries" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to My Deliveries
        </Link>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}>
          {currentStyle.label || normalizedStatus}
        </div>
      </div>

      {/* Package Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-48 h-48 relative rounded-xl overflow-hidden bg-gray-100 border shrink-0">
          {booking.package_image ? (
            <Image src={booking.package_image} alt={booking.package_title} fill className="object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-1">
              <Package className="w-8 h-8" />
              <span className="text-xs">No image provided</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between w-full h-full gap-4">
          <div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-mono font-semibold text-gray-400">
                Tracking: {booking.tracking_number}
              </span>
              <span className="text-xs text-gray-400">Created: {new Date(booking.created_at).toLocaleDateString()}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{booking.package_title}</h1>
            <p className="text-xs text-gray-500 font-medium">Trip: {booking.trip_title}</p>

            <div className="flex items-center text-gray-800 text-sm gap-2 mt-3 p-2.5 bg-gray-50 rounded-lg border w-fit">
              <span className="font-semibold">{booking.route.from_city}, {booking.route.from_country}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-semibold">{booking.route.to_city}, {booking.route.to_country}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t">
            <div>
              <span className="text-gray-400 block">Sender</span>
              <span className="font-bold text-gray-800 truncate block">{booking.sender_name}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Weight</span>
              <span className="font-bold text-gray-800 block">{booking.agreed_weight_kg} kg</span>
            </div>
            <div>
              <span className="text-gray-400 block">Reward</span>
              <span className="font-bold text-emerald-600 block">{booking.currency} ${booking.agreed_reward}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Escrow Status</span>
              <span className="font-bold text-purple-600 uppercase block">{booking.escrow_status || "HELD"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Step Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Delivery Progress</h3>
        
        {isCancelled ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <XCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold">Booking Cancelled</p>
              <p className="text-xs">{booking.traveler_refusal_reason || "This booking was cancelled or expired."}</p>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 text-left md:text-center z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                      isCompleted
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : isCurrent
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCompleted
                        ? "text-emerald-600"
                        : isCurrent
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dynamic Workflow Interactive Cards Based on Status */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
        
        {/* STATUS: PAYMENT_PENDING */}
        {normalizedStatus === "PAYMENT_PENDING" && (
          <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-xl text-amber-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-base">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Waiting for Payment</span>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              The sender has not completed payment yet. Pickup verification cannot begin until payment is confirmed and held in escrow.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold mt-2 pt-2 border-t border-amber-200/60">
              <span>Payment Status: <strong className="text-red-600">{booking.payment_status || "UNPAID"}</strong></span>
              <span>Escrow Status: <strong className="text-red-600">{booking.escrow_status || "NOT FUNDED"}</strong></span>
            </div>
          </div>
        )}

        {/* STATUS: CONFIRMED */}
        {normalizedStatus === "CONFIRMED" && (
          <div className="flex flex-col gap-4">
            <div className="border-b pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Verify Physical Package</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Inspect the package with the sender. Confirm the size, weight, and visual appearance match the item description before taking responsibility.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border flex flex-col gap-3">
              <p className="text-xs font-bold text-slate-700">Does the physical package match the listing?</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  onClick={() => {
                    setModalError(null);
                    setPickupModalOpen(true);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> YES — Package Matches
                </Button>

                <Button
                  variant="destructive"
                  className="font-bold text-xs"
                  onClick={() => {
                    setModalError(null);
                    setRejectModalOpen(true);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-1.5" /> NO — Reject Package
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STATUS: PICKED_UP */}
        {normalizedStatus === "PICKED_UP" && (
          <div className="flex flex-col gap-5">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Package successfully picked up</p>
                <p className="text-xs text-emerald-700">The pickup PIN was authenticated. You are now responsible for this package.</p>
              </div>
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <p className="text-xs text-gray-500">Ready to depart? Click start transit to update the sender.</p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6"
                disabled={submitting}
                onClick={handleStartTransit}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />}
                Start Transit
              </Button>
            </div>
          </div>
        )}

        {/* STATUS: IN_TRANSIT */}
        {normalizedStatus === "IN_TRANSIT" && (
          <div className="flex flex-col gap-5">
            <div className="border border-blue-100 bg-blue-50/40 p-5 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Package is currently in transit</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                You are currently en route to the destination. Once you meet the receiver, request the 6-digit Delivery Verification PIN to finish the booking and release funds.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border mt-2 text-xs">
                <div>
                  <span className="text-gray-400 block">Reward</span>
                  <span className="font-bold text-emerald-600">{booking.currency} ${booking.agreed_reward}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Escrow</span>
                  <span className="font-bold text-purple-600">Funds Held Securely</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Destination</span>
                  <span className="font-bold text-gray-800">{booking.route.to_city}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Tracking</span>
                  <span className="font-mono font-bold text-gray-800">{booking.tracking_number}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6"
                onClick={() => {
                  setModalError(null);
                  setDeliveryModalOpen(true);
                }}
              >
                <ShieldCheck className="w-4 h-4 mr-2" /> Complete Delivery
              </Button>
            </div>
          </div>
        )}

        {/* STATUS: DELIVERED / COMPLETED */}
        {(normalizedStatus === "COMPLETED" || normalizedStatus === "DELIVERED") && (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center flex flex-col items-center gap-3">
            <div className="p-3 bg-emerald-600 text-white rounded-full">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-emerald-900">Delivery Completed Successfully</h2>
            <p className="text-xs text-emerald-700 max-w-md">
              The delivery PIN has been verified. The escrow funds of <strong>{booking.currency} ${booking.agreed_reward}</strong> have been released to your wallet.
            </p>

            <div className="flex gap-3 mt-4">
              <Link href="/deliveries">
                <Button variant="outline" className="text-xs font-semibold">Back to My Deliveries</Button>
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* ----------------- MODALS SECTION ----------------- */}

      {/* 1. Pickup PIN Modal */}
      <Dialog open={pickupModalOpen} onOpenChange={setPickupModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <KeyRound className="w-5 h-5 text-blue-600" /> Pickup Verification
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Ask the sender for the 6-digit Pickup Verification PIN to complete handoff.
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
              {modalError}
            </div>
          )}

          <div className="py-2">
            <label className="text-xs font-bold text-gray-700 block mb-1">Pickup PIN</label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 028287"
              value={pickupPin}
              onChange={(e) => setPickupPin(e.target.value)}
              className="w-full text-center text-xl font-mono tracking-widest py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPickupModalOpen(false)}>Cancel</Button>
            <Button className="bg-blue-600 text-white" disabled={submitting} onClick={handleVerifyPickup}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Pickup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Reject Package Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-red-600">
              <XCircle className="w-5 h-5" /> Reject Package
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Please explain why the physical package was rejected.
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
              {modalError}
            </div>
          )}

          <div className="py-2">
            <label className="text-xs font-bold text-gray-700 block mb-1">Reason for Refusal</label>
            <textarea
              rows={3}
              placeholder="e.g. Package exceeds agreed dimensions or does not match listing photos."
              value={refusalReason}
              onChange={(e) => setRefusalReason(e.target.value)}
              className="w-full text-xs p-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={submitting} onClick={handleRejectPackage}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Delivery PIN Modal */}
      <Dialog open={deliveryModalOpen} onOpenChange={setDeliveryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Verify Delivery
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Ask the recipient for their 6-digit Delivery Verification PIN.
            </DialogDescription>
          </DialogHeader>

          {modalError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
              {modalError}
            </div>
          )}

          <div className="py-2">
            <label className="text-xs font-bold text-gray-700 block mb-1">Delivery PIN</label>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. 983111"
              value={deliveryPin}
              onChange={(e) => setDeliveryPin(e.target.value)}
              className="w-full text-center text-xl font-mono tracking-widest py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeliveryModalOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 text-white" disabled={submitting} onClick={handleVerifyDelivery}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Delivery"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Package,
  X,
  ExternalLink,
  User,
  Loader2,
  Check,
  XCircle,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { bookingApi, RawBooking } from "@/api/booking.api";
import { DelivaryData, SenderData } from "@/interface/DelivaryData";

// ----------------------------------------------------------------------
// Data Transformer (Preserves String UUIDs & Reads Route Info)
// ----------------------------------------------------------------------

interface ExtendedTripDetails {
  id: string;
  trackingNo: string;
  pickupCity: string;
  pickupCountry: string;
  destinationCity: string;
  destinationCountry: string;
  createdAt: string;
}

const transformRawBookingToDeliveryData = (
  raw: RawBooking & {
    from_city?: string;
    from_country?: string;
    to_city?: string;
    to_country?: string;
  }
): { delivery: DelivaryData; sender: SenderData; rawId: string } => {
  const pickupCity = raw.route?.from_city || raw.from_city || "N/A";
  const pickupCountry = raw.route?.from_country || raw.from_country || "N/A";
  const destinationCity = raw.route?.to_city || raw.to_city || "N/A";
  const destinationCountry = raw.route?.to_country || raw.to_country || "N/A";

  const statusMap: Record<string, "pending" | "in-progress" | "completed"> = {
    PENDING: "pending",
    ACCEPTED: "in-progress",
    COMPLETED: "completed",
  };

  const deliveryStatusMap: Record<string, "In Progress" | "Delivered" | "Cancelled"> = {
    ACCEPTED: "In Progress",
    COMPLETED: "Delivered",
    CANCELLED: "Cancelled",
  };

  const mappedStatus = statusMap[raw.status] || "pending";

  const tripData: ExtendedTripDetails = {
    id: raw.id,
    trackingNo: raw.tracking_number,
    pickupCity,
    pickupCountry,
    destinationCity,
    destinationCountry,
    createdAt: raw.created_at
      ? new Date(raw.created_at).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "N/A",
  };

  const delivery: DelivaryData = {
    delivaryId: Number(raw.id) || 0,
    name: raw.package_title || "Unnamed Package",
    status: mappedStatus,
    tripData: tripData as unknown as DelivaryData["tripData"],
    images: raw.package_image
      ? [raw.package_image]
      : [
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80",
        ],
  };

  const sender: SenderData = {
    senderId: Number(raw.id) || 0,
    name: raw.sender_name || "Unknown Sender",
    senderProfileStatus: "Verified",
    email: raw.sender_email,
    delivarystatus: deliveryStatusMap[raw.status] || "In Progress",
    senderPackageWeight: `${raw.agreed_weight_kg || 0} kg`,
    senderWeight: parseFloat(raw.agreed_weight_kg || "0"),
    senderPrice: parseFloat(raw.agreed_reward || "0"),
    tripData: tripData as unknown as SenderData["tripData"],
  };

  return { delivery, sender, rawId: raw.id };
};


const getStatusBadge = (status: "pending" | "in-progress" | "completed") => {
  switch (status) {
    case "pending":
      return {
        label: "Pending Request",
        bg: "bg-amber-50 text-amber-700 border-amber-200/80",
        dot: "bg-amber-500",
      };
    case "in-progress":
      return {
        label: "In Progress",
        bg: "bg-blue-50 text-blue-700 border-blue-200/80",
        dot: "bg-blue-500",
      };
    case "completed":
      return {
        label: "Completed",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        dot: "bg-emerald-500",
      };
    default:
      return {
        label: status,
        bg: "bg-slate-50 text-slate-700 border-slate-200",
        dot: "bg-slate-400",
      };
  }
};

// ----------------------------------------------------------------------
// Component Definition
// ----------------------------------------------------------------------

export function PendingRequests() {
  const [items, setItems] = useState<
    { delivery: DelivaryData; sender: SenderData; rawId: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"pending" | "in-progress">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<{
    delivery: DelivaryData;
    sender: SenderData;
    rawId: string;
  } | null>(null);

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookingApi.getTravelerPendingBookings();

      if (res && res.data) {
        const transformed = res.data.map(transformRawBookingToDeliveryData);
        setItems(transformed);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Failed to load pending requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const handleBookingAction = async (
    bookingUuid: string,
    action: "ACCEPT" | "REJECT"
  ) => {
    if (!bookingUuid) return;

    try {
      setActionLoadingId(bookingUuid);
      await bookingApi.respondToBooking(bookingUuid, action);
      setItems((prev) => prev.filter((item) => item.rawId !== bookingUuid));
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err.message ||
        `Failed to ${action.toLowerCase()} request.`;
      alert(errorMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(({ delivery, sender }) => {
      if (activeTab === "pending" && delivery.status !== "pending") return false;
      if (activeTab === "in-progress" && delivery.status !== "in-progress") return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        // Type assertion for local access:
        const trip = delivery.tripData as { pickupCity?: string; destinationCity?: string };

        return (
          delivery.name.toLowerCase().includes(q) ||
          sender.name.toLowerCase().includes(q) ||
          (sender.email && sender.email.toLowerCase().includes(q)) ||
          trip?.pickupCity?.toLowerCase().includes(q) ||
          trip?.destinationCity?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [items, activeTab, searchQuery]);

  return (
    <div className="min-h-screen w-full bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-10 text-slate-800">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📦</span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Pending Delivery Requests
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Review sender packages, approve travel delivery requests, and manage routes.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search package, sender, route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="mt-6 flex border-b border-slate-200/80">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-bold transition-all ${
              activeTab === "pending"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Pending Requests</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 font-extrabold">
              {items.filter((i) => i.delivery.status === "pending").length}
            </span>
          </button>
        </div>

        {/* CONTENT AREA */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading requests...
            </p>
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 text-sm font-medium">
            {error}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-16 px-6 text-center">
            <Package className="h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No Pending Requests</h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              There are currently no active pending requests waiting for your action.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredItems.map(({ delivery, sender, rawId }) => {
              const badge = getStatusBadge(delivery.status);
              const isProcessing = actionLoadingId === rawId;

              // Local type assertion for trip details
              const trip = delivery.tripData as {
                pickupCity?: string;
                pickupCountry?: string;
                destinationCity?: string;
                destinationCountry?: string;
              } | undefined;

              return (
                <div
                  key={rawId}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Package Info, Image & Route */}
                    <div className="md:col-span-4 flex items-center gap-4">
                      <img
                        src={
                          delivery.images?.[0] ||
                          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80"
                        }
                        alt={delivery.name}
                        className="h-16 w-16 rounded-xl object-cover border border-slate-100 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {sender.senderPackageWeight || "0 kg"}
                        </span>
                        <h3 className="mt-1 text-sm font-bold text-slate-900 truncate">
                          {delivery.name}
                        </h3>

                        {/* ROUTE DISPLAY */}
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {trip?.pickupCity}, {trip?.pickupCountry}
                          </span>
                          <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {trip?.destinationCity}, {trip?.destinationCountry}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sender Info */}
                    <div className="md:col-span-4 flex items-center justify-between gap-4 border-y md:border-y-0 md:border-x border-slate-100 py-4 md:py-0 md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold text-xs shrink-0">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {sender.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">
                            {sender.email || "No email provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Offered Price & Status Badge */}
                    <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-6 text-right">
                      <div className="text-left md:text-right text-xs">
                        <div className="font-extrabold text-slate-900 text-base">
                          ${sender.senderPrice?.toFixed(2) || "0.00"}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Offered Reward</p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.bg}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* BOTTOM ACTIONS */}
                  <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => setSelectedItem({ delivery, sender, rawId })}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                      View Details
                    </button>

                    {delivery.status === "pending" && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleBookingAction(rawId, "REJECT")}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          Reject
                        </button>

                        <button
                          disabled={isProcessing}
                          onClick={() => handleBookingAction(rawId, "ACCEPT")}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Accept Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
    {/* DETAILS MODAL */}
    {selectedItem && (() => {
      const trip = selectedItem.delivery.tripData as {
        pickupCity?: string;
        pickupCountry?: string;
        destinationCity?: string;
        destinationCountry?: string;
      } | undefined;

      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Delivery Overview</h3>
                <p className="text-xs font-mono text-slate-500">
                  ID: {selectedItem.rawId}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <img
                  src={selectedItem.delivery.images?.[0]}
                  alt={selectedItem.delivery.name}
                  className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {selectedItem.delivery.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Status: <span className="capitalize font-semibold">{selectedItem.delivery.status}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="font-semibold text-slate-500">Route:</span>
                  <span className="font-bold text-blue-600">
                    {trip?.pickupCity} ({trip?.pickupCountry}) ➔ {trip?.destinationCity} ({trip?.destinationCountry})
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Sender Name:</span>
                  <span className="font-bold text-slate-900">
                    {selectedItem.sender.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sender Email:</span>
                  <span className="font-bold text-slate-900">
                    {selectedItem.sender.email || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Package Weight:</span>
                  <span className="font-bold text-slate-900">
                    {selectedItem.sender.senderPackageWeight || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Offered Reward:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    ${selectedItem.sender.senderPrice?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    })()}
    </div>
  );
}

export default PendingRequests;
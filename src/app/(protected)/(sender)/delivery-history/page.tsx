"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Calendar,
  Download,
  Package,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Star,
  Receipt,
  FileText,
  X,
  ArrowRight,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  User,
  MapPin,
  CreditCard,
  Building2,
  Clock,
} from "lucide-react";

// ----------------------------------------------------------------------
// 1. Types & Interface Definitions
// ----------------------------------------------------------------------

export type ClosedStatus = "COMPLETED" | "CANCELLED" | "REFUNDED" | "EXPIRED";

export interface ReviewData {
  rating: number;
  comment?: string;
  date: string;
}

export interface TravelerInfo {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

export interface TimelineEvent {
  title: string;
  timestamp: string;
  completed: boolean;
  location?: string;
}

export interface ClosedDelivery {
  id: string;
  trackingNo: string;
  packageName: string;
  category: string;
  weightKg: number;
  rewardPaid: number;
  packageImage: string;
  traveler?: TravelerInfo;
  pickupCity: string;
  pickupCountry: string;
  pickupAddress?: string;
  destinationCity: string;
  destinationCountry: string;
  destinationAddress?: string;
  paymentMethod: string;
  completedDate: string;
  status: ClosedStatus;
  cancellationReason?: string;
  review?: ReviewData;
  timelineEvents: TimelineEvent[];
}

// ----------------------------------------------------------------------
// 2. Mock Data (Archived / Closed Deliveries Only)
// ----------------------------------------------------------------------

const INITIAL_HISTORY: ClosedDelivery[] = [
  {
    id: "del_01",
    trackingNo: "LL-2026-ZX8899",
    packageName: "MacBook Pro M3 Max 16-inch",
    category: "Electronics",
    weightKg: 2.2,
    packageImage:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    traveler: {
      id: "tr_101",
      name: "John Smith",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      rating: 4.9,
    },
    pickupCity: "Dhaka",
    pickupCountry: "Bangladesh",
    pickupAddress: "House 12, Road 5, Banani, Dhaka",
    destinationCity: "London",
    destinationCountry: "UK",
    destinationAddress: "22 Baker Street, Marylebone, London NW1 6XE",
    rewardPaid: 65.0,
    paymentMethod: "Stripe Escrow",
    completedDate: "24 July 2026",
    status: "COMPLETED",
    review: undefined, // Sender has NOT rated yet
    timelineEvents: [
      { title: "Booking Sent", timestamp: "20 July 2026, 09:30 AM", completed: true },
      { title: "Traveler Accepted", timestamp: "20 July 2026, 11:15 AM", completed: true },
      { title: "Payment Completed", timestamp: "20 July 2026, 11:30 AM", completed: true },
      { title: "Booking Confirmed", timestamp: "20 July 2026, 11:31 AM", completed: true },
      { title: "Package Picked Up", timestamp: "22 July 2026, 03:00 PM", completed: true, location: "Dhaka Banani" },
      { title: "In Transit", timestamp: "23 July 2026, 02:40 AM", completed: true, location: "Flight BG001" },
      { title: "Delivered", timestamp: "24 July 2026, 01:15 PM", completed: true, location: "London NW1" },
      { title: "Completed", timestamp: "24 July 2026, 01:30 PM", completed: true },
    ],
  },
  {
    id: "del_02",
    trackingNo: "LL-2026-AB1234",
    packageName: "Designer Leather Handbag",
    category: "Fashion",
    weightKg: 1.4,
    packageImage:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80",
    traveler: {
      id: "tr_102",
      name: "Sarah Jenkins",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      rating: 5.0,
    },
    pickupCity: "New York",
    pickupCountry: "USA",
    pickupAddress: "100 5th Ave, New York, NY 10011",
    destinationCity: "Paris",
    destinationCountry: "France",
    destinationAddress: "14 Rue de Rivoli, 75004 Paris",
    rewardPaid: 50.0,
    paymentMethod: "Visa ending 4242",
    completedDate: "18 July 2026",
    status: "COMPLETED",
    review: {
      rating: 5,
      comment: "Super smooth delivery and great communication!",
      date: "19 July 2026",
    },
    timelineEvents: [
      { title: "Booking Sent", timestamp: "15 July 2026, 08:00 AM", completed: true },
      { title: "Traveler Accepted", timestamp: "15 July 2026, 09:12 AM", completed: true },
      { title: "Payment Completed", timestamp: "15 July 2026, 09:20 AM", completed: true },
      { title: "Booking Confirmed", timestamp: "15 July 2026, 09:21 AM", completed: true },
      { title: "Package Picked Up", timestamp: "16 July 2026, 10:00 AM", completed: true },
      { title: "In Transit", timestamp: "17 July 2026, 06:30 PM", completed: true },
      { title: "Delivered", timestamp: "18 July 2026, 11:00 AM", completed: true },
      { title: "Completed", timestamp: "18 July 2026, 11:10 AM", completed: true },
    ],
  },
  {
    id: "del_03",
    trackingNo: "LL-2026-CC4411",
    packageName: "Canon Camera Lens",
    category: "Photography",
    weightKg: 0.9,
    packageImage:
      "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=400&q=80",
    traveler: {
      id: "tr_103",
      name: "Marcus Vance",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      rating: 4.7,
    },
    pickupCity: "Toronto",
    pickupCountry: "Canada",
    destinationCity: "Dubai",
    destinationCountry: "UAE",
    rewardPaid: 70.0,
    paymentMethod: "Apple Pay",
    completedDate: "10 July 2026",
    status: "REFUNDED",
    cancellationReason: "Traveler flight cancelled. Full refund issued.",
    timelineEvents: [
      { title: "Booking Sent", timestamp: "08 July 2026, 02:00 PM", completed: true },
      { title: "Traveler Accepted", timestamp: "08 July 2026, 03:00 PM", completed: true },
      { title: "Payment Completed", timestamp: "08 July 2026, 03:05 PM", completed: true },
      { title: "Cancelled & Refunded", timestamp: "10 July 2026, 08:30 AM", completed: true },
    ],
  },
  {
    id: "del_04",
    trackingNo: "LL-2026-EX9900",
    packageName: "Medical Documents Envelope",
    category: "Documents",
    weightKg: 0.3,
    packageImage:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
    pickupCity: "Singapore",
    pickupCountry: "Singapore",
    destinationCity: "Sydney",
    destinationCountry: "Australia",
    rewardPaid: 35.0,
    paymentMethod: "Wallet Balance",
    completedDate: "02 July 2026",
    status: "CANCELLED",
    cancellationReason: "Sender cancelled booking request prior to pickup.",
    timelineEvents: [
      { title: "Booking Sent", timestamp: "01 July 2026, 10:00 AM", completed: true },
      { title: "Booking Cancelled", timestamp: "02 July 2026, 09:00 AM", completed: true },
    ],
  },
  {
    id: "del_05",
    trackingNo: "LL-2026-XP0011",
    packageName: "Handmade Pottery Set",
    category: "Art & Crafts",
    weightKg: 3.1,
    packageImage:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80",
    pickupCity: "Berlin",
    pickupCountry: "Germany",
    pickupAddress: "Alexanderplatz 1, 10178 Berlin",
    destinationCity: "Madrid",
    destinationCountry: "Spain",
    rewardPaid: 40.0,
    paymentMethod: "Credit Card",
    completedDate: "20 June 2026",
    status: "EXPIRED",
    cancellationReason: "No matching traveler accepted before pickup deadline.",
    timelineEvents: [
      { title: "Booking Sent", timestamp: "15 June 2026, 08:00 AM", completed: true },
      { title: "Request Expired", timestamp: "20 June 2026, 11:59 PM", completed: true },
    ],
  },
];

// Helper to get Status Badge formatting
const getStatusBadge = (status: ClosedStatus) => {
  switch (status) {
    case "COMPLETED":
      return {
        label: "Completed",
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        dot: "bg-emerald-500",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        bg: "bg-rose-50 text-rose-700 border-rose-200/80",
        dot: "bg-rose-500",
      };
    case "REFUNDED":
      return {
        label: "Refunded",
        bg: "bg-amber-50 text-amber-700 border-amber-200/80",
        dot: "bg-amber-500",
      };
    case "EXPIRED":
      return {
        label: "Expired",
        bg: "bg-slate-100 text-slate-700 border-slate-300/80",
        dot: "bg-slate-500",
      };
  }
};

// ----------------------------------------------------------------------
// 3. Main Component
// ----------------------------------------------------------------------

export default function DeliveryHistoryPage() {
  const [deliveries, setDeliveries] = useState<ClosedDelivery[]>(INITIAL_HISTORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Drawers & Modal States
  const [trackingDrawerDelivery, setTrackingDrawerDelivery] = useState<ClosedDelivery | null>(null);
  const [detailsDrawerDelivery, setDetailsDrawerDelivery] = useState<ClosedDelivery | null>(null);
  const [ratingModalDelivery, setRatingModalDelivery] = useState<ClosedDelivery | null>(null);
  const [selectedStarRating, setSelectedStarRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");

  // Summary statistics calculations
  const stats = useMemo(() => {
    const completed = deliveries.filter((d) => d.status === "COMPLETED").length;
    const cancelled = deliveries.filter((d) => d.status === "CANCELLED").length;
    const refunded = deliveries.filter((d) => d.status === "REFUNDED").length;
    const totalPaid = deliveries
      .filter((d) => d.status === "COMPLETED")
      .reduce((sum, d) => sum + d.rewardPaid, 0);

    return { completed, cancelled, refunded, totalPaid };
  }, [deliveries]);

  // Filtering logic
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTracking = item.trackingNo.toLowerCase().includes(q);
        const matchName = item.packageName.toLowerCase().includes(q);
        const matchTraveler = item.traveler?.name.toLowerCase().includes(q);
        const matchCity =
          item.pickupCity.toLowerCase().includes(q) ||
          item.destinationCity.toLowerCase().includes(q);

        return matchTracking || matchName || matchTraveler || matchCity;
      }

      return true;
    });
  }, [deliveries, statusFilter, searchQuery]);

  // Handle Review Submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalDelivery) return;

    const newReview: ReviewData = {
      rating: selectedStarRating,
      comment: reviewComment,
      date: "24 July 2026",
    };

    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === ratingModalDelivery.id ? { ...d, review: newReview } : d
      )
    );

    setRatingModalDelivery(null);
    setReviewComment("");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-10 text-slate-800">
      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADER */}
        <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📜</span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Delivery History
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Review all completed, cancelled, refunded, and expired deliveries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tracking, package..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-2xs focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="hidden sm:inline">Date Filter</span>
            </button>

            <button className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-blue-500 transition-all">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mt-6 flex w-full gap-4 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:pb-0">
          <div className="min-w-[220px] flex-1 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Completed
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-slate-900">{stats.completed}</span>
              <p className="text-xs text-slate-500 mt-0.5">Total Completed Deliveries</p>
            </div>
          </div>

          <div className="min-w-[220px] flex-1 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cancelled
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-slate-900">{stats.cancelled}</span>
              <p className="text-xs text-slate-500 mt-0.5">Total Cancelled Deliveries</p>
            </div>
          </div>

          <div className="min-w-[220px] flex-1 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Refunded
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <RotateCcw className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-slate-900">{stats.refunded}</span>
              <p className="text-xs text-slate-500 mt-0.5">Total Refunded Deliveries</p>
            </div>
          </div>

          <div className="min-w-[220px] flex-1 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Amount Paid
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-slate-900">
                ${stats.totalPaid.toFixed(2)}
              </span>
              <p className="text-xs text-slate-500 mt-0.5">Total Amount Paid</p>
            </div>
          </div>
        </div>

        {/* DELIVERY HISTORY LIST CARDS */}
        <div className="mt-8 space-y-4">
          {filteredDeliveries.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-16 px-6 text-center shadow-2xs">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                <Package className="h-10 w-10 stroke-[1.5]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Delivery History</h3>
              <p className="mt-2 max-w-sm text-xs sm:text-sm text-slate-500">
                Your completed deliveries will appear here after successful deliveries.
              </p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-500 transition-all">
                Find Travelers
              </button>
            </div>
          ) : (
            filteredDeliveries.map((item) => {
              const badge = getStatusBadge(item.status);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Package Details */}
                    <div className="md:col-span-4 flex items-center gap-4">
                      <img
                        src={item.packageImage}
                        alt={item.packageName}
                        className="h-16 w-16 rounded-xl object-cover border border-slate-100 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          <span className="text-xs text-slate-400">• {item.weightKg} kg</span>
                        </div>
                        <h3 className="mt-1 text-sm font-bold text-slate-900 truncate">
                          {item.packageName}
                        </h3>
                        <p className="mt-0.5 font-mono text-xs text-slate-500">
                          {item.trackingNo}
                        </p>
                      </div>
                    </div>

                    {/* Traveler & Route */}
                    <div className="md:col-span-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-y md:border-y-0 md:border-x border-slate-100 py-4 md:py-0 md:px-6">
                      <div className="flex items-center gap-3">
                        {item.traveler ? (
                          <>
                            <img
                              src={item.traveler.avatar}
                              alt={item.traveler.name}
                              className="h-10 w-10 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {item.traveler.name}
                              </h4>
                              <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-0.5">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span>{item.traveler.rating}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                              <User className="h-4 w-4" />
                            </div>
                            <span className="text-xs italic text-slate-400">Unassigned</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:items-end text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>{item.pickupCity}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{item.destinationCity}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          {item.pickupCountry} to {item.destinationCountry}
                        </span>
                      </div>
                    </div>

                    {/* Reward, Payment & Status Badge */}
                    <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-6 text-right">
                      <div className="text-left md:text-right text-xs">
                        <div className="font-extrabold text-slate-900 text-sm">
                          ${item.rewardPaid.toFixed(2)}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.paymentMethod}</p>
                        <p className="text-[10px] text-slate-400">{item.completedDate}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.bg}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* BOTTOM CARD ACTIONS */}
                  <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      {item.status === "COMPLETED" && item.review && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-amber-50/70 border border-amber-200/60 px-3 py-1.5 rounded-xl">
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < item.review!.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-200 fill-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold text-amber-950">
                            You already reviewed this traveler
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setDetailsDrawerDelivery(item)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => setTrackingDrawerDelivery(item)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100/70 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                        Track Delivery
                      </button>

                      {item.status === "COMPLETED" && (
                        <>
                          <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                            <Receipt className="h-3.5 w-3.5 text-slate-400" />
                            Receipt
                          </button>

                          <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            Invoice
                          </button>
                        </>
                      )}

                      {item.status === "COMPLETED" && !item.review && (
                        <button
                          onClick={() => {
                            setRatingModalDelivery(item);
                            setSelectedStarRating(5);
                            setReviewComment("");
                          }}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-all"
                        >
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          Rate Traveler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* TRACK DELIVERY DRAWER */}
      {trackingDrawerDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-2xs transition-all">
          <div className="h-full w-full max-w-md bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Delivery Tracking History</h3>
                <p className="text-xs font-mono text-slate-500">
                  {trackingDrawerDelivery.trackingNo}
                </p>
              </div>
              <button
                onClick={() => setTrackingDrawerDelivery(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 text-xs text-blue-900 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold block">Closed Archive Record</span>
                  <span className="text-blue-700">All delivery milestones for this booking are verified.</span>
                </div>
              </div>

              {/* Milestones Vertical List */}
              <div className="relative pl-4 space-y-6">
                <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-200" />

                {trackingDrawerDelivery.timelineEvents.map((evt, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{evt.timestamp}</p>
                      {evt.location && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" /> {evt.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS DRAWER */}
      {detailsDrawerDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-2xs transition-all">
          <div className="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Delivery Summary</h3>
                <p className="text-xs font-mono text-slate-500">{detailsDrawerDelivery.trackingNo}</p>
              </div>
              <button
                onClick={() => setDetailsDrawerDelivery(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Package Header */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <img
                  src={detailsDrawerDelivery.packageImage}
                  alt={detailsDrawerDelivery.packageName}
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                    {detailsDrawerDelivery.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {detailsDrawerDelivery.packageName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Weight: <span className="font-semibold text-slate-700">{detailsDrawerDelivery.weightKg} kg</span>
                  </p>
                </div>
              </div>

              {/* Status Reason if cancelled/refunded */}
              {detailsDrawerDelivery.cancellationReason && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-800">
                  <span className="font-bold block mb-1">Reason for cancellation/refund:</span>
                  {detailsDrawerDelivery.cancellationReason}
                </div>
              )}

              {/* Route Details */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Route & Locations</h5>
                <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Pickup</span>
                      <p className="text-xs font-bold text-slate-900">
                        {detailsDrawerDelivery.pickupCity}, {detailsDrawerDelivery.pickupCountry}
                      </p>
                      {detailsDrawerDelivery.pickupAddress && (
                        <p className="text-xs text-slate-500 mt-0.5">{detailsDrawerDelivery.pickupAddress}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Destination</span>
                      <p className="text-xs font-bold text-slate-900">
                        {detailsDrawerDelivery.destinationCity}, {detailsDrawerDelivery.destinationCountry}
                      </p>
                      {detailsDrawerDelivery.destinationAddress && (
                        <p className="text-xs text-slate-500 mt-0.5">{detailsDrawerDelivery.destinationAddress}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Traveler Information */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Traveler Details</h5>
                {detailsDrawerDelivery.traveler ? (
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={detailsDrawerDelivery.traveler.avatar}
                        alt={detailsDrawerDelivery.traveler.name}
                        className="h-11 w-11 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {detailsDrawerDelivery.traveler.name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-0.5">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{detailsDrawerDelivery.traveler.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No traveler was assigned to this request.</p>
                )}
              </div>

              {/* Payment Receipt Summary */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Breakdown</h5>
                <div className="rounded-2xl border border-slate-200 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Traveler Reward</span>
                    <span className="font-semibold text-slate-900">${detailsDrawerDelivery.rewardPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Payment Method</span>
                    <span className="font-semibold text-slate-900">{detailsDrawerDelivery.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-t border-slate-100 pt-2 font-bold text-slate-900">
                    <span>Total Settled</span>
                    <span>${detailsDrawerDelivery.rewardPaid.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Existing Review display */}
              {detailsDrawerDelivery.review && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Feedback</h5>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < detailsDrawerDelivery.review!.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 fill-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">{detailsDrawerDelivery.review.date}</span>
                    </div>
                    {detailsDrawerDelivery.review.comment && (
                      <p className="text-slate-700 italic">"{detailsDrawerDelivery.review.comment}"</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {ratingModalDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Rate Traveler</h3>
              <button
                onClick={() => setRatingModalDelivery(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
              {ratingModalDelivery.traveler && (
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <img
                    src={ratingModalDelivery.traveler.avatar}
                    alt={ratingModalDelivery.traveler.name}
                    className="h-10 w-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {ratingModalDelivery.traveler.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Delivered {ratingModalDelivery.packageName}
                    </p>
                  </div>
                </div>
              )}

              {/* Star Rating selector */}
              <div className="text-center py-2">
                <label className="text-xs font-semibold text-slate-600 block mb-2">
                  Select Score Rating
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedStarRating(star)}
                      className="p-1 focus:outline-hidden transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= selectedStarRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200 fill-slate-100"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text Area */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Your Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of your experience with this traveler..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingModalDelivery(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
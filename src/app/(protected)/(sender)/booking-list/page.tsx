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
  Clock,
  ChevronRight,
  AlertCircle,
  CreditCard,
} from "lucide-react";

// ----------------------------------------------------------------------
// 1. Types & Interfaces
// ----------------------------------------------------------------------

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "EXPIRED";

export interface Milestone {
  step: number;
  title: string;
  completed: boolean;
  active: boolean;
  timestamp?: string;
  location?: string;
}

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

export interface Booking {
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
  dateCreated: string;
  completedDate?: string;
  status: BookingStatus;
  currentStep: number; // 1 to 8
  cancellationReason?: string;
  review?: ReviewData;
  milestones: Milestone[];
}

// ----------------------------------------------------------------------
// 2. Default Milestone Definitions
// ----------------------------------------------------------------------

const STAGES = [
  "Booking Request",
  "Accepted",
  "Payment",
  "Confirmed",
  "Picked Up",
  "In Transit",
  "Delivered",
  "Completed",
];

const createMilestones = (
  currentStep: number,
  timestamps: Record<number, string> = {},
  locations: Record<number, string> = {}
): Milestone[] => {
  return STAGES.map((title, index) => {
    const stepNumber = index + 1;
    return {
      step: stepNumber,
      title,
      completed: stepNumber < currentStep || currentStep === 8,
      active: stepNumber === currentStep && currentStep !== 8,
      timestamp: timestamps[stepNumber] || (stepNumber <= currentStep ? "Recorded" : undefined),
      location: locations[stepNumber],
    };
  });
};

// ----------------------------------------------------------------------
// 3. Mock Initial Data (Active & Closed Bookings)
// ----------------------------------------------------------------------

const INITIAL_BOOKINGS: Booking[] = [
  // PENDING BOOKING
  {
    id: "del_00",
    trackingNo: "LL-2026-PENDING01",
    packageName: "Sony WH-1000XM5 Headphones",
    category: "Electronics",
    weightKg: 0.8,
    packageImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    pickupCity: "Dhaka",
    pickupCountry: "Bangladesh",
    pickupAddress: "Gulshan 2, Dhaka",
    destinationCity: "Bangkok",
    destinationCountry: "Thailand",
    destinationAddress: "Sukhumvit Road, Bangkok",
    rewardPaid: 45.0,
    paymentMethod: "Escrow Pending",
    dateCreated: "24 July 2026",
    status: "PENDING",
    currentStep: 1,
    milestones: createMilestones(
      1,
      { 1: "24 July 2026, 10:00 AM" },
      { 1: "Dhaka, Bangladesh" }
    ),
  },
  // ACCEPTED BOOKING (IN TRANSIT)
  {
    id: "del_01_active",
    trackingNo: "LL-2026-ACTIVE02",
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
    destinationAddress: "22 Baker Street, London NW1 6XE",
    rewardPaid: 65.0,
    paymentMethod: "Stripe Escrow",
    dateCreated: "20 July 2026",
    status: "ACCEPTED",
    currentStep: 6, // In Transit
    milestones: createMilestones(
      6,
      {
        1: "20 July 2026, 09:30 AM",
        2: "20 July 2026, 11:15 AM",
        3: "20 July 2026, 11:30 AM",
        4: "20 July 2026, 11:31 AM",
        5: "22 July 2026, 03:00 PM",
        6: "23 July 2026, 02:40 AM",
      },
      {
        5: "Banani Hub, Dhaka",
        6: "Flight BG001 - En Route to LHR",
      }
    ),
  },
  // COMPLETED BOOKING
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
    dateCreated: "15 July 2026",
    completedDate: "18 July 2026",
    status: "COMPLETED",
    currentStep: 8,
    review: {
      rating: 5,
      comment: "Super smooth delivery and great communication!",
      date: "19 July 2026",
    },
    milestones: createMilestones(
      8,
      {
        1: "15 July 2026, 08:00 AM",
        2: "15 July 2026, 09:12 AM",
        3: "15 July 2026, 09:20 AM",
        4: "15 July 2026, 09:21 AM",
        5: "16 July 2026, 10:00 AM",
        6: "17 July 2026, 06:30 PM",
        7: "18 July 2026, 11:00 AM",
        8: "18 July 2026, 11:10 AM",
      },
      {
        5: "NYC Pickup Point",
        6: "JFK Airport Terminal 4",
        7: "Paris Recipient Handover",
      }
    ),
  },
];

// Helper to calculate badge formatting
const getStatusBadge = (status: BookingStatus) => {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending Traveler",
        bg: "bg-amber-50 text-amber-700 border-amber-200/80",
        dot: "bg-amber-500",
      };
    case "ACCEPTED":
      return {
        label: "Accepted & Active",
        bg: "bg-blue-50 text-blue-700 border-blue-200/80",
        dot: "bg-blue-500",
      };
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
        bg: "bg-purple-50 text-purple-700 border-purple-200/80",
        dot: "bg-purple-500",
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
// 4. Main Component
// ----------------------------------------------------------------------

export default function BookingsAndDeliveriesPage() {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Drawer / Modal States
  const [trackingModalBooking, setTrackingModalBooking] = useState<Booking | null>(null);
  const [detailsDrawerBooking, setDetailsDrawerBooking] = useState<Booking | null>(null);
  const [ratingModalBooking, setRatingModalBooking] = useState<Booking | null>(null);
  const [selectedStarRating, setSelectedStarRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");

  // Statistics
  const stats = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "PENDING").length;
    const accepted = bookings.filter((b) => b.status === "ACCEPTED").length;
    const completed = bookings.filter((b) => b.status === "COMPLETED").length;
    const totalPaid = bookings
      .filter((b) => b.status === "COMPLETED" || b.status === "ACCEPTED")
      .reduce((sum, b) => sum + b.rewardPaid, 0);

    return { pending, accepted, completed, totalPaid };
  }, [bookings]);

  // Filtered List
  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      // Tab Filtering
      if (activeTab === "ACTIVE" && !(item.status === "PENDING" || item.status === "ACCEPTED")) {
        return false;
      }
      if (
        activeTab === "HISTORY" &&
        (item.status === "PENDING" || item.status === "ACCEPTED")
      ) {
        return false;
      }

      // Status Dropdown Filter
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;

      // Search Query
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
  }, [bookings, activeTab, statusFilter, searchQuery]);

  // Handle Review Submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingModalBooking) return;

    const newReview: ReviewData = {
      rating: selectedStarRating,
      comment: reviewComment,
      date: "24 July 2026",
    };

    setBookings((prev) =>
      prev.map((b) =>
        b.id === ratingModalBooking.id ? { ...b, review: newReview } : b
      )
    );

    setRatingModalBooking(null);
    setReviewComment("");
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-10 text-slate-800">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">📦</span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Bookings & Deliveries
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Manage your active delivery requests and view past closed history.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tracking, item..."
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
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* TOP STATS */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pending Requests
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.pending}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Accepted / Active
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.accepted}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Completed
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-slate-900">{stats.completed}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Escrow Value
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-extrabold text-slate-900">
                ${stats.totalPaid.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="mt-8 flex border-b border-slate-200/80">
          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-bold transition-all ${
              activeTab === "ACTIVE"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Active Bookings</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 font-extrabold">
              {stats.pending + stats.accepted}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-sm font-bold transition-all ${
              activeTab === "HISTORY"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Closed History</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-extrabold">
              {bookings.length - (stats.pending + stats.accepted)}
            </span>
          </button>
        </div>

        {/* BOOKING CARDS LIST */}
        <div className="mt-6 space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-16 px-6 text-center shadow-2xs">
              <Package className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No Bookings Found</h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                {activeTab === "ACTIVE"
                  ? "You have no active pending or accepted delivery requests."
                  : "No completed or cancelled delivery history matching your query."}
              </p>
            </div>
          ) : (
            filteredBookings.map((item) => {
              const badge = getStatusBadge(item.status);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    
                    {/* Item & Category */}
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
                            <span className="text-xs italic text-slate-400">Waiting Traveler...</span>
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

                    {/* Reward & Status Badge */}
                    <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-6 text-right">
                      <div className="text-left md:text-right text-xs">
                        <div className="font-extrabold text-slate-900 text-sm">
                          ${item.rewardPaid.toFixed(2)}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.paymentMethod}</p>
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

                  {/* BOTTOM ACTION BUTTONS */}
                  <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-400">
                      Created: <span className="font-semibold text-slate-600">{item.dateCreated}</span>
                    </span>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setDetailsDrawerBooking(item)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        View Details
                      </button>

                      {/* TRACKING BUTTON (OPENS TIMELINE PROGRESS) */}
                      <button
                        onClick={() => setTrackingModalBooking(item)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                        Track Timeline Progress
                      </button>

                      {item.status === "COMPLETED" && !item.review && (
                        <button
                          onClick={() => {
                            setRatingModalBooking(item);
                            setSelectedStarRating(5);
                            setReviewComment("");
                          }}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-all"
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

      {/* ---------------------------------------------------------------------- */}
      {/* 5. PROGRESS TIMELINE TRACKING MODAL (STAGES 1 TO 8)                    */}
      {/* ---------------------------------------------------------------------- */}
      {trackingModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Delivery Status Timeline</h3>
                <p className="text-xs font-mono text-slate-500">
                  {trackingModalBooking.trackingNo}
                </p>
              </div>
              <button
                onClick={() => setTrackingModalBooking(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Timeline */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Item Info Summary */}
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <img
                  src={trackingModalBooking.packageImage}
                  alt={trackingModalBooking.packageName}
                  className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {trackingModalBooking.packageName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {trackingModalBooking.pickupCity} $\rightarrow$ {trackingModalBooking.destinationCity}
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  Stage {trackingModalBooking.currentStep} of 8
                </span>
              </div>

              {/* 8-STAGE VERTICAL TIMELINE */}
              <div className="relative pl-6 space-y-6 my-4">
                {/* Connecting Line */}
                <div className="absolute left-[23px] top-3 bottom-3 w-0.5 bg-slate-200" />

                {trackingModalBooking.milestones.map((m) => {
                  const isDone = m.completed;
                  const isActive = m.active;

                  return (
                    <div key={m.step} className="relative flex items-start gap-4">
                      
                      {/* Step Number Dot / Icon */}
                      <div
                        className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold shadow-2xs transition-all ${
                          isDone
                            ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                            : isActive
                            ? "bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse"
                            : "bg-slate-100 text-slate-400 border border-slate-300"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span>{m.step}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-xs font-bold ${
                              isDone || isActive ? "text-slate-900" : "text-slate-400"
                            }`}
                          >
                            {m.step}. {m.title}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              In Progress
                            </span>
                          )}
                        </div>

                        {m.timestamp && (
                          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                            {m.timestamp}
                          </p>
                        )}

                        {m.location && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" /> {m.location}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 p-4 bg-slate-50 text-right">
              <button
                onClick={() => setTrackingModalBooking(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close Tracking
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DETAILS DRAWER */}
      {detailsDrawerBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-2xs transition-all">
          <div className="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Booking Summary</h3>
                <p className="text-xs font-mono text-slate-500">{detailsDrawerBooking.trackingNo}</p>
              </div>
              <button
                onClick={() => setDetailsDrawerBooking(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <img
                  src={detailsDrawerBooking.packageImage}
                  alt={detailsDrawerBooking.packageName}
                  className="h-16 w-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                    {detailsDrawerBooking.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {detailsDrawerBooking.packageName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Weight: <span className="font-semibold text-slate-700">{detailsDrawerBooking.weightKg} kg</span>
                  </p>
                </div>
              </div>

              {/* Route Details */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Route</h5>
                <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Pickup Address</span>
                      <p className="text-xs font-bold text-slate-900">
                        {detailsDrawerBooking.pickupCity}, {detailsDrawerBooking.pickupCountry}
                      </p>
                      {detailsDrawerBooking.pickupAddress && (
                        <p className="text-xs text-slate-500 mt-0.5">{detailsDrawerBooking.pickupAddress}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Destination Address</span>
                      <p className="text-xs font-bold text-slate-900">
                        {detailsDrawerBooking.destinationCity}, {detailsDrawerBooking.destinationCountry}
                      </p>
                      {detailsDrawerBooking.destinationAddress && (
                        <p className="text-xs text-slate-500 mt-0.5">{detailsDrawerBooking.destinationAddress}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {ratingModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Rate Traveler</h3>
              <button
                onClick={() => setRatingModalBooking(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="mt-5 space-y-4">
              <div className="text-center py-2">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedStarRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
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

              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share feedback on delivery speed and handling..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-blue-600/20"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRatingModalBooking(null)}
                  className="rounded-xl border px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
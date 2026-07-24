"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  Star,
  UserCheck,
  Package,
  ArrowRight,
  RefreshCw,
  X,
  Languages,
  Send,
  CreditCard,
  Eye,
  Sparkles,
  MapPin,
  ShieldCheck,
} from "lucide-react";

// ----------------------------------------------------------------------
// 1. Types & Interfaces
// ----------------------------------------------------------------------

export type MatchStatus =
  | "AVAILABLE"
  | "BOOKING_SENT"
  | "ACCEPTED"
  | "BOOKED"
  | "REJECTED";

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Traveler {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  rating: number;
  completedDeliveries: number;
  matchScore: number; // 0 to 100
  status: MatchStatus;
  languages: string[];
  bio: string;
  vehicle: string;
  // Trip Details
  tripTitle: string;
  departureCity: string;
  departureCountry: string;
  destinationCity: string;
  destinationCountry: string;
  departureDate: string;
  arrivalDate: string;
  maxCapacityKg: number;
  remainingCapacityKg: number;
  reviews: Review[];
}

export interface SenderPackage {
  id: string;
  name: string;
  weightKg: number;
  rewardAmount: number;
  fragile: boolean;
  signatureRequired: boolean;
  matchingCount: number;
}

// ----------------------------------------------------------------------
// 2. Mock Data
// ----------------------------------------------------------------------

const MOCK_PACKAGES: SenderPackage[] = [
  {
    id: "pkg_1",
    name: "MacBook Pro 16\"",
    weightKg: 2.5,
    rewardAmount: 65,
    fragile: true,
    signatureRequired: true,
    matchingCount: 4,
  },
  {
    id: "pkg_2",
    name: "Important Legal Documents",
    weightKg: 0.5,
    rewardAmount: 35,
    fragile: false,
    signatureRequired: true,
    matchingCount: 3,
  },
  {
    id: "pkg_3",
    name: "Winter Jackets & Clothes",
    weightKg: 5.0,
    rewardAmount: 80,
    fragile: false,
    signatureRequired: false,
    matchingCount: 2,
  },
  {
    id: "pkg_4",
    name: "iPhone 15 Pro Box",
    weightKg: 0.8,
    rewardAmount: 45,
    fragile: true,
    signatureRequired: true,
    matchingCount: 0,
  },
];

const MOCK_TRAVELERS: Record<string, Traveler[]> = {
  pkg_1: [
    {
      id: "tr_1",
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      verified: true,
      rating: 4.9,
      completedDeliveries: 42,
      matchScore: 98,
      status: "AVAILABLE",
      languages: ["English", "German"],
      bio: "Frequent business traveler between NYC and London. I handle electronics and high-value items with extreme care.",
      vehicle: "Personal Suitcase / Flight",
      tripTitle: "NYC to London Business Flight",
      departureCity: "New York",
      departureCountry: "USA",
      destinationCity: "London",
      destinationCountry: "UK",
      departureDate: "28 Jul 2026",
      arrivalDate: "29 Jul 2026",
      maxCapacityKg: 15.0,
      remainingCapacityKg: 8.5,
      reviews: [
        {
          id: "rev_1",
          author: "Sarah K.",
          rating: 5,
          date: "12 Jul 2026",
          comment: "Delivered my laptop safely and ahead of schedule. Highly recommended!",
        },
      ],
    },
    {
      id: "tr_2",
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
      verified: true,
      rating: 4.8,
      completedDeliveries: 29,
      matchScore: 88,
      status: "ACCEPTED",
      languages: ["English", "Spanish", "French"],
      bio: "Digital nomad traveling with extra baggage space. Prompt communication always guaranteed.",
      vehicle: "Airline Flight",
      tripTitle: "JFK to LHR Summer Trip",
      departureCity: "New York",
      departureCountry: "USA",
      destinationCity: "London",
      destinationCountry: "UK",
      departureDate: "30 Jul 2026",
      arrivalDate: "31 Jul 2026",
      maxCapacityKg: 20.0,
      remainingCapacityKg: 12.0,
      reviews: [],
    },
    {
      id: "tr_3",
      name: "David Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      verified: true,
      rating: 4.7,
      completedDeliveries: 18,
      matchScore: 76,
      status: "BOOKING_SENT",
      languages: ["English", "Mandarin"],
      bio: "Reliable courier for personal and commercial items.",
      vehicle: "Flight",
      tripTitle: "New York Transatlantic Flight",
      departureCity: "New York",
      departureCountry: "USA",
      destinationCity: "London",
      destinationCountry: "UK",
      departureDate: "02 Aug 2026",
      arrivalDate: "03 Aug 2026",
      maxCapacityKg: 10.0,
      remainingCapacityKg: 4.0,
      reviews: [],
    },
    {
      id: "tr_4",
      name: "Julian Thorne",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
      verified: false,
      rating: 4.2,
      completedDeliveries: 5,
      matchScore: 64,
      status: "REJECTED",
      languages: ["English"],
      bio: "Occasional holiday traveler.",
      vehicle: "Luggage",
      tripTitle: "NYC to UK Express",
      departureCity: "New York",
      departureCountry: "USA",
      destinationCity: "London",
      destinationCountry: "UK",
      departureDate: "05 Aug 2026",
      arrivalDate: "06 Aug 2026",
      maxCapacityKg: 8.0,
      remainingCapacityKg: 3.0,
      reviews: [],
    },
  ],
  pkg_2: [
    {
      id: "tr_5",
      name: "Amara Okafor",
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80",
      verified: true,
      rating: 5.0,
      completedDeliveries: 64,
      matchScore: 99,
      status: "BOOKED",
      languages: ["English"],
      bio: "Executive assistant traveling twice monthly. I specialize in urgent document deliveries.",
      vehicle: "Carry-on Briefcase",
      tripTitle: "Express Document Flight NYC-LHR",
      departureCity: "New York",
      departureCountry: "USA",
      destinationCity: "London",
      destinationCountry: "UK",
      departureDate: "27 Jul 2026",
      arrivalDate: "27 Jul 2026",
      maxCapacityKg: 5.0,
      remainingCapacityKg: 4.5,
      reviews: [],
    },
  ],
};

// ----------------------------------------------------------------------
// 3. Helper Components
// ----------------------------------------------------------------------

const MatchScoreMeter = ({ score }: { score: number }) => {
  let colorClass = "text-emerald-500 bg-emerald-50 border-emerald-200";
  let strokeColor = "#22C55E";

  if (score < 70) {
    colorClass = "text-amber-500 bg-amber-50 border-amber-200";
    strokeColor = "#F59E0B";
  } else if (score < 90) {
    colorClass = "text-blue-600 bg-blue-50 border-blue-200";
    strokeColor = "#2563EB";
  }

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
<div className="flex w-full items-center gap-2 shrink-0">
  <div className="relative flex h-10 w-full sm:h-11 items-center justify-center">
        <svg className="h-10 w-10 sm:h-11 sm:w-11 -rotate-90 transform">
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-100"
            fill="transparent"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke={strokeColor}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <span className="absolute text-[10px] sm:text-[11px] font-extrabold text-slate-800">
          {score}%
        </span>
      </div>
      <div className="hidden xs:block">
        <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Match
        </span>
        <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold ${colorClass}`}>
          {score >= 90 ? "Excellent" : score >= 70 ? "Great" : "Fair"}
        </span>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: MatchStatus }) => {
  switch (status) {
    case "AVAILABLE":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-700 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          AVAILABLE
        </span>
      );
    case "BOOKING_SENT":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-amber-700 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          SENT
        </span>
      );
    case "ACCEPTED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-blue-700 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          ACCEPTED
        </span>
      );
    case "BOOKED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-purple-700 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          BOOKED
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-rose-700 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          REJECTED
        </span>
      );
  }
};

// ----------------------------------------------------------------------
// 4. Main Component
// ----------------------------------------------------------------------

export default function MyMatchingPage() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>("pkg_1");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("HIGHEST_MATCH");
  const [activeDrawerTraveler, setActiveDrawerTraveler] = useState<Traveler | null>(null);

  const [travelersMap, setTravelersMap] = useState<Record<string, Traveler[]>>(MOCK_TRAVELERS);

  const selectedPackage = useMemo(
    () => MOCK_PACKAGES.find((p) => p.id === selectedPackageId) || MOCK_PACKAGES[0],
    [selectedPackageId]
  );

  const currentPackageTravelers = useMemo(
    () => travelersMap[selectedPackageId] || [],
    [travelersMap, selectedPackageId]
  );

  const stats = useMemo(() => {
    let matched = 0;
    let available = 0;
    let requestsSent = 0;
    let rejected = 0;

    Object.values(travelersMap).forEach((list) => {
      matched += list.length;
      list.forEach((t) => {
        if (t.status === "AVAILABLE") available++;
        if (t.status === "BOOKING_SENT") requestsSent++;
        if (t.status === "REJECTED") rejected++;
      });
    });

    return { matched, available, requestsSent, rejected };
  }, [travelersMap]);

  const filteredTravelers = useMemo(() => {
    return currentPackageTravelers
      .filter((t) => {
        if (statusFilter !== "ALL" && t.status !== statusFilter) return false;

        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchName = t.name.toLowerCase().includes(q);
          const matchTitle = t.tripTitle.toLowerCase().includes(q);
          const matchDest =
            t.destinationCity.toLowerCase().includes(q) ||
            t.destinationCountry.toLowerCase().includes(q);
          return matchName || matchTitle || matchDest;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "HIGHEST_MATCH") return b.matchScore - a.matchScore;
        if (sortBy === "HIGHEST_RATING") return b.rating - a.rating;
        if (sortBy === "MOST_DELIVERIES") return b.completedDeliveries - a.completedDeliveries;
        if (sortBy === "EARLIEST_DEPARTURE")
          return new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime();
        return 0;
      });
  }, [currentPackageTravelers, statusFilter, searchQuery, sortBy]);

  const handleUpdateStatus = (travelerId: string, newStatus: MatchStatus) => {
    setTravelersMap((prev) => {
      const currentList = prev[selectedPackageId] || [];
      const updatedList = currentList.map((t) =>
        t.id === travelerId ? { ...t, status: newStatus } : t
      );
      return { ...prev, [selectedPackageId]: updatedList };
    });

    if (activeDrawerTraveler && activeDrawerTraveler.id === travelerId) {
      setActiveDrawerTraveler((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] py-4 sm:py-8 px-2 sm:px-6 lg:px-10 text-slate-800">
      <div className="w-full mx-auto">

        {/* HEADER */}
        <div className="w-full flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🤝</span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Matching
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 w-full max-w-2xl">
              Review travelers matched with your package. Compare travelers, view trip details, and send booking requests.
            </p>
          </div>

          {/* CONTROLS (FULL WIDTH ON MOBILE) */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search traveler..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 shadow-2xs placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-600 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="BOOKING_SENT">Booking Sent</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="BOOKED">Booked</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-600 focus:outline-hidden cursor-pointer"
              >
                <option value="HIGHEST_MATCH">Highest Match Score</option>
                <option value="HIGHEST_RATING">Highest Rating</option>
                <option value="EARLIEST_DEPARTURE">Earliest Departure</option>
                <option value="MOST_DELIVERIES">Most Deliveries</option>
              </select>
            </div>
          </div>
        </div>

        {/* STATS (FULL WIDTH) */}
        <div className="w-full mt-5 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
                Matched
              </span>
              <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{stats.matched}</span>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
                Available
              </span>
              <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{stats.available}</span>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
                Requests Sent
              </span>
              <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{stats.requestsSent}</span>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate">
                Rejected
              </span>
              <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shrink-0">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <div className="mt-1.5 sm:mt-2">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{stats.rejected}</span>
            </div>
          </div>
        </div>

        {/* PACKAGE SELECTOR TABS (FULL WIDTH WRAPPER) */}
        <div className="w-full mt-6 border-b border-slate-200/80">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Package
            </h2>
          </div>
          <div className="w-full flex space-x-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {MOCK_PACKAGES.map((pkg) => {
              const isSelected = pkg.id === selectedPackageId;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  <Package className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                  <span>{pkg.name}</span>
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {pkg.matchingCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SELECTED PACKAGE BANNER (FULL WIDTH) */}
        <div className="w-full mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 sm:p-4">
          <div className="w-full sm:w-auto flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 w-full">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                Matching for: <span className="text-blue-600">{selectedPackage.name}</span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>Weight: {selectedPackage.weightKg} kg</span> •{" "}
                <span>Reward: ${selectedPackage.rewardAmount}</span> •{" "}
                <span>Fragile: {selectedPackage.fragile ? "Yes" : "No"}</span>
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto text-center sm:text-right text-[11px] sm:text-xs text-slate-500 bg-white border border-blue-200/60 px-2.5 py-1 rounded-lg font-medium shrink-0">
            {filteredTravelers.length} traveler{filteredTravelers.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* MATCHING TRAVELER CARDS GRID (100% MOBILE WIDTH) */}
        <div className="w-full mt-5">
          {filteredTravelers.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-12 px-4 text-center shadow-2xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Matching Travelers Found</h3>
              <p className="mt-1 max-w-md text-xs text-slate-500">
                We couldn't find any travelers matching your filters for this package.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredTravelers.map((traveler) => {
                return (
                  <div
                    key={traveler.id}
                    className="w-full flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs transition-all hover:shadow-md hover:border-slate-300"
                  >
                    <div className="w-full">
                      {/* CARD HEADER */}
                      <div className="w-full flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            <img
                              src={traveler.avatar}
                              alt={traveler.name}
                              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover border border-slate-200 shadow-2xs"
                            />
                            {traveler.verified && (
                              <ShieldCheck className="absolute -bottom-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 fill-white" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {traveler.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                              <span className="flex items-center text-amber-500 font-bold shrink-0">
                                <Star className="h-3 w-3 fill-amber-400 mr-0.5" />
                                {traveler.rating}
                              </span>
                              <span>•</span>
                              <span className="truncate">{traveler.completedDeliveries} trips</span>
                            </div>
                          </div>
                        </div>

                        <StatusBadge status={traveler.status} />
                      </div>

                      {/* MATCH SCORE & TRIP TITLE */}
                      <div className="w-full mt-3 flex items-center justify-between bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-100 gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                            Trip Title
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {traveler.tripTitle}
                          </h4>
                        </div>
                        <MatchScoreMeter score={traveler.matchScore} />
                      </div>

                      {/* TRIP ROUTE & DATES */}
                      <div className="w-full mt-3.5 space-y-2.5">
                        <div className="w-full flex items-center justify-between text-xs gap-1">
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400">
                              Departure
                            </span>
                            <span className="font-bold text-slate-800 truncate">
                              {traveler.departureCity}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                              {traveler.departureDate}
                            </span>
                          </div>

                          <div className="flex items-center justify-center px-1 shrink-0">
                            <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                          </div>

                          <div className="flex flex-col items-end min-w-0 flex-1 text-right">
                            <span className="text-[9px] uppercase font-bold text-slate-400">
                              Destination
                            </span>
                            <span className="font-bold text-slate-800 truncate">
                              {traveler.destinationCity}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                              {traveler.arrivalDate}
                            </span>
                          </div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="w-full rounded-xl border border-slate-100 p-2 sm:p-2.5">
                          <div className="flex justify-between text-[10px] sm:text-[11px] font-medium text-slate-600 mb-1">
                            <span>Available Capacity:</span>
                            <span className="font-bold text-slate-800">
                              {traveler.remainingCapacityKg} / {traveler.maxCapacityKg} kg
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{
                                width: `${
                                  (traveler.remainingCapacityKg / traveler.maxCapacityKg) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* PACKAGE REWARD MATCH */}
                      <div className="w-full mt-3 border-t border-slate-100 pt-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-500 truncate mr-2">
                            {selectedPackage.name}
                          </span>
                          <span className="font-extrabold text-blue-600 shrink-0">
                            ${selectedPackage.rewardAmount} Reward
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* FULL WIDTH CARD ACTIONS FOR MOBILE */}
                    <div className="w-full mt-4 border-t border-slate-100 pt-3">
                      {traveler.status === "AVAILABLE" && (
                        <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                          <button
                            onClick={() => setActiveDrawerTraveler(traveler)}
                            className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-400" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(traveler.id, "BOOKING_SENT")}
                            className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 px-3 text-xs font-bold text-white hover:bg-blue-700 shadow-xs shadow-blue-600/20 transition-all cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Send Request
                          </button>
                        </div>
                      )}

                      {traveler.status === "BOOKING_SENT" && (
                        <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                          <button
                            onClick={() => setActiveDrawerTraveler(traveler)}
                            className="w-full sm:w-1/3 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-400" />
                            View
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(traveler.id, "AVAILABLE")}
                            className="w-full sm:w-2/3 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Cancel Request
                          </button>
                        </div>
                      )}

                      {traveler.status === "ACCEPTED" && (
                        <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                          <button
                            onClick={() => setActiveDrawerTraveler(traveler)}
                            className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-400" />
                            Details
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(traveler.id, "BOOKED")}
                            className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            Confirm & Pay
                          </button>
                        </div>
                      )}

                      {traveler.status === "BOOKED" && (
                        <button
                          onClick={() => setActiveDrawerTraveler(traveler)}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                          Trip Booked — Manage
                        </button>
                      )}

                      {traveler.status === "REJECTED" && (
                        <button
                          onClick={() => setActiveDrawerTraveler(traveler)}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          View Profile
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* DETAILS MODAL (CENTERED, RESPONSIVE)                                 */}
      {/* ---------------------------------------------------------------------- */}
      {activeDrawerTraveler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* MODAL HEADER */}
            <div className="w-full flex items-center justify-between border-b border-slate-200 p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Traveler Details & Trip Overview
              </h2>
              <button
                onClick={() => setActiveDrawerTraveler(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="w-full p-4 sm:p-6 space-y-5">
              {/* PROFILE HERO */}
              <div className="w-full flex items-start gap-3 sm:gap-4">
                <div className="relative shrink-0">
                  <img
                    src={activeDrawerTraveler.avatar}
                    alt={activeDrawerTraveler.name}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-white shadow-md"
                  />
                  {activeDrawerTraveler.verified && (
                    <ShieldCheck className="absolute -bottom-1 -right-1 h-5 w-5 sm:h-6 sm:w-6 text-blue-600 fill-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      {activeDrawerTraveler.name}
                    </h3>
                    {activeDrawerTraveler.verified && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="flex items-center text-amber-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 mr-0.5" />
                      {activeDrawerTraveler.rating}
                    </span>
                    <span>•</span>
                    <span>{activeDrawerTraveler.completedDeliveries} deliveries</span>
                  </div>
                </div>
              </div>

              {/* MATCH SCORE BANNER */}
              <div className="w-full flex items-center justify-between rounded-2xl bg-blue-50/70 border border-blue-100 p-3 sm:p-4">
                <div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase text-blue-600 block">
                    Package Match Score
                  </span>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    Based on capacity, route, and timing.
                  </p>
                </div>
                <MatchScoreMeter score={activeDrawerTraveler.matchScore} />
              </div>

              {/* BIO & LANGUAGES */}
              <div className="w-full space-y-2">
                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                  About Traveler
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{activeDrawerTraveler.bio}"
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <Languages className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Speaks: {activeDrawerTraveler.languages.join(", ")}</span>
                </div>
              </div>

              {/* TRIP ITINERARY DETAILS */}
              <div className="w-full space-y-2">
                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                  Trip Itinerary
                </h4>
                <div className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">
                        {activeDrawerTraveler.departureCity}, {activeDrawerTraveler.departureCountry}
                      </span>
                      <span className="text-slate-400">{activeDrawerTraveler.departureDate}</span>
                    </div>
                  </div>

                  <div className="ml-3 border-l-2 border-dashed border-slate-200 h-5 pl-5" />

                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">
                        {activeDrawerTraveler.destinationCity}, {activeDrawerTraveler.destinationCountry}
                      </span>
                      <span className="text-slate-400">{activeDrawerTraveler.arrivalDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LUGGAGE CAPACITY & VEHICLE */}
              <div className="w-full space-y-2">
                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                  Luggage & Transport
                </h4>
                <div className="w-full grid grid-cols-2 gap-2.5 text-xs">
                  <div className="rounded-xl border border-slate-200 p-2.5 bg-white">
                    <span className="text-slate-400 block font-medium text-[10px]">Method</span>
                    <span className="font-bold text-slate-800 mt-0.5 block truncate">
                      {activeDrawerTraveler.vehicle}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-2.5 bg-white">
                    <span className="text-slate-400 block font-medium text-[10px]">Space Available</span>
                    <span className="font-bold text-blue-600 mt-0.5 block truncate">
                      {activeDrawerTraveler.remainingCapacityKg} kg left
                    </span>
                  </div>
                </div>
              </div>

              {/* REVIEWS SECTION */}
              <div className="w-full space-y-2">
                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                  Traveler Reviews ({activeDrawerTraveler.reviews.length})
                </h4>
                {activeDrawerTraveler.reviews.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No public reviews available yet.</p>
                ) : (
                  <div className="w-full space-y-2">
                    {activeDrawerTraveler.reviews.map((rev) => (
                      <div key={rev.id} className="w-full rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{rev.author}</span>
                          <span className="text-slate-400 text-[10px]">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-amber-500 my-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400" />
                          ))}
                        </div>
                        <p className="text-slate-600 mt-1">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* MODAL ACTION FOOTER */}
            <div className="w-full border-t border-slate-200 bg-slate-50 p-4 sm:p-6">
              {activeDrawerTraveler.status === "AVAILABLE" && (
                <button
                  onClick={() => handleUpdateStatus(activeDrawerTraveler.id, "BOOKING_SENT")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-4 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  Send Booking Request (${selectedPackage.rewardAmount})
                </button>
              )}

              {activeDrawerTraveler.status === "BOOKING_SENT" && (
                <button
                  onClick={() => handleUpdateStatus(activeDrawerTraveler.id, "AVAILABLE")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 px-4 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Booking Request
                </button>
              )}

              {activeDrawerTraveler.status === "ACCEPTED" && (
                <button
                  onClick={() => handleUpdateStatus(activeDrawerTraveler.id, "BOOKED")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 px-4 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                  Confirm & Pay (${selectedPackage.rewardAmount})
                </button>
              )}

              {activeDrawerTraveler.status === "BOOKED" && (
                <div className="w-full text-center py-2.5 text-xs font-bold text-purple-700 bg-purple-100/60 rounded-xl border border-purple-200">
                  ✓ Booking Confirmed & Escrow Active
                </div>
              )}

              {activeDrawerTraveler.status === "REJECTED" && (
                <div className="w-full text-center py-2.5 text-xs font-bold text-rose-700 bg-rose-100/60 rounded-xl border border-rose-200">
                  This booking request was declined.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
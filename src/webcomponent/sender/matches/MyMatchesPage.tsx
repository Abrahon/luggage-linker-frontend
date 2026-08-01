"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getMyMatches, sendBookingRequest, MatchItem } from "@/api/matching.api";
import { Search, SlidersHorizontal, PackageSearch } from "lucide-react";
import { MatchCard } from "../card/MatchCard";
import { toast } from "sonner";
import { MatchDetailModal } from "./MatchDetailModal";

export default function MyMatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("SCORE");

  // Selected match for the View Details Modal
  const [selectedTripMatch, setSelectedTripMatch] = useState<MatchItem | null>(null);

  // Fetch Matches Data from API
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await getMyMatches();
      if (res.success && res.data) {
        setMatches(res.data);
      } else {
        setMatches([]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to load match recommendations.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Direct Booking Handler with Toast Feedback
  const handleDirectBooking = async (match: MatchItem) => {
    try {
      setSubmittingId(match.id);
      
      const payload = {
        match_id: match.id,
        package_id: match.package,
        trip_id: match.trip,
        weight_kg: parseFloat(match.remaining_weight) || 0,
        message: `Booking request for ${match.package_title}`,
      };

      await sendBookingRequest(payload);
      toast.success(`Booking request sent successfully to ${match.traveler_name}!`);

      // Update local state to show 'REQUESTED' immediately
      setMatches((prevMatches) =>
        prevMatches.map((m) =>
          m.id === match.id ? { ...m, status: "REQUESTED" } : m
        )
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to send booking request. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  // Filter & Sort Operations
  const filteredMatches = useMemo(() => {
    return matches
      .filter((m) => {
        if (statusFilter !== "ALL" && m.status !== statusFilter) return false;
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.package_title?.toLowerCase().includes(q);
          const matchTraveler = m.traveler_name?.toLowerCase().includes(q);
          const matchCity =
            m.package_destination_city?.toLowerCase().includes(q) ||
            m.package_pickup_city?.toLowerCase().includes(q);
          return matchTitle || matchTraveler || matchCity;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "SCORE") {
          return parseFloat(b.score || "0") - parseFloat(a.score || "0");
        }
        if (sortBy === "REWARD") {
          return parseFloat(b.reward_per_kg || "0") - parseFloat(a.reward_per_kg || "0");
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [matches, statusFilter, searchQuery, sortBy]);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 py-4 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-10 antialiased text-slate-800">
      <div className="w-full max-w-(--breakpoint-2xl) mx-auto space-y-4 sm:space-y-6">
        
        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Matched Travelers & Trips
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Automated AI-matched traveler routes compatible with your active package listings.
            </p>
          </div>
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs sm:text-sm rounded-full shrink-0">
            {matches.length} Compatible Matches
          </div>
        </div>

        {/* Responsive Filter Controls Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full lg:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search package, traveler name, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 rounded-xl transition-all outline-hidden text-xs sm:text-sm"
            />
          </div>

          {/* Select Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2.5 w-full lg:w-auto">
            
            {/* Status Filter Dropdown */}
            <div className="w-full sm:w-auto flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="REQUESTED">Requested</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:bg-white focus:border-blue-600 transition-all outline-hidden cursor-pointer"
            >
              <option value="SCORE">Sort by Match Score</option>
              <option value="REWARD">Highest Reward Rate</option>
              <option value="NEWEST">Newest Matches</option>
            </select>
          </div>
        </div>

        {/* Matches Grid: 1 Col Mobile | 2 Col Tablet | 3 Col Desktop */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse p-5 space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3" />
                <div className="h-8 bg-slate-200 rounded w-3/4" />
                <div className="h-16 bg-slate-100 rounded" />
                <div className="h-10 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="w-full py-12 sm:py-16 bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-4 sm:p-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <PackageSearch className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">No Matches Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1">
              There are currently no traveler matches available for your request. Try modifying search terms or resetting filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isSubmitting={submittingId === match.id}
                onViewTrip={(selected) => setSelectedTripMatch(selected)}
                onSendBooking={handleDirectBooking}
              />
            ))}
          </div>
        )}

        {/* View Trip Detail Modal */}
        <MatchDetailModal
          isOpen={!!selectedTripMatch}
          match={selectedTripMatch}
          isSubmitting={submittingId === selectedTripMatch?.id}
          onClose={() => setSelectedTripMatch(null)}
          onSendBooking={handleDirectBooking}
        />
      </div>
    </div>
  );
}
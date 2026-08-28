"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  ArrowUpDown,
  Plane,
  Loader2,
  CheckCircle2,
  Star,
  Luggage,
  Coins,
  ArrowRight,
  Search,
  MapPin,
} from "lucide-react";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { BackendTrip, getPublicTripsApi } from "@/api/trip.api";
import { getMyBookings } from "@/api/booking.api";
import { getMyMatches } from "@/api/matching.api";
import { TripDetailDialog } from "@/components/ui/TripDetailDialog";
import { SendRequestDialog } from "../sender/find-travellers/SendRequestDialog";

// Auth context & package API
import { useAuth } from "@/context/AuthContext";

const airports = [
  { city: "Dhaka", airport: "Hazrat Shahjalal" },
  { city: "Chittagong", airport: "Shah Amanat" },
  { city: "Sylhet", airport: "Osmani International" },
  { city: "Berlin", airport: "Berlin Brandenburg" },
  { city: "London", airport: "Heathrow Airport" },
  { city: "New York", airport: "JFK Airport" },
  { city: "Singapore", airport: "Changi Airport" },
  { city: "Dubai", airport: "Dubai International" },
  { city: "Tokyo", airport: "Narita International" },
  { city: "Paris", airport: "Charles de Gaulle" },
];

export const FindTravelers = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [trips, setTrips] = useState<BackendTrip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [requestingTripId, setRequestingTripId] = useState<string | null>(null);
  const [requestedTripIds, setRequestedTripIds] = useState<Set<string>>(new Set());

  // Dialog Controls for Trips
  const [selectedTripForDetail, setSelectedTripForDetail] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);

  const [selectedTripForRequest, setSelectedTripForRequest] = useState<BackendTrip | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState<boolean>(false);

  // Search Inputs
  const [fromInput, setFromInput] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [fromAirport, setFromAirport] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);

  const [toInput, setToInput] = useState("");
  const [toCity, setToCity] = useState("");
  const [toAirport, setToAirport] = useState("");
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [date, setDate] = useState("");

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicTripsApi({
        from_city: fromCity || undefined,
        to_city: toCity || undefined,
        departure_date: date || undefined,
      });
      setTrips(data);
    } catch (error) {
      console.error("Failed to fetch public trips:", error);
    } finally {
      setLoading(false);
    }
  }, [fromCity, toCity, date]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const refreshRequestStates = useCallback(async () => {
    if (user?.role !== "SENDER") return;

    try {
      const [matches, bookings] = await Promise.all([
        getMyMatches(),
        getMyBookings(),
      ]);
      const completedTripTitles = new Set(
        bookings.results
          .filter((booking) => booking.status === "COMPLETED")
          .map((booking) => booking.trip_title.trim().toLowerCase())
      );
      const activeTripIds = matches
        .filter(
          (match) =>
            (match.status === "REQUESTED" || match.status === "ACCEPTED") &&
            !completedTripTitles.has(match.trip_title.trim().toLowerCase())
        )
        .map((match) => match.trip);

      setRequestedTripIds(new Set(activeTripIds));
    } catch (error) {
      console.error("Failed to refresh booking request states:", error);
    }
  }, [user?.role]);

  useEffect(() => {
    refreshRequestStates();
    const refreshInterval = window.setInterval(refreshRequestStates, 15000);
    return () => window.clearInterval(refreshInterval);
  }, [refreshRequestStates]);

  // Profile navigation handler
  const handleProfileClick = (travelerId?: string) => {
    if (travelerId) {
      router.push(`/travelers/${travelerId}`);
    }
  };

  // Handle Booking Request Execution
  const handleBookingRequest = async (trip: BackendTrip) => {
    if (!user) {
      router.push(`/login?redirectTo=/find-travelers&action=booking_request`);
      return;
    }

    if (user.role !== "SENDER") {
      toast.error("Only Senders can send booking requests.");
      return;
    }

    setDetailDialogOpen(false);

    const travelerId = trip.traveler?.id;
    const isOwner =
      (user.email && trip.traveler_email && user.email.toLowerCase() === trip.traveler_email.toLowerCase()) ||
      (user.id && (trip as { user_id?: string }).user_id === user.id) ||
      (user.id && travelerId && user.id === travelerId);

    if (isOwner) {
      toast.error("You cannot send a booking request for your own trip.");
      return;
    }

    setSelectedTripForRequest(trip);
    if (requestedTripIds.has(trip.id)) return;
    setRequestingTripId(trip.id);
    setRequestDialogOpen(true);
  };

  const getFilteredAirports = (input: string) => {
    if (!input) return airports;
    return airports.filter(
      (a) =>
        a.city.toLowerCase().includes(input.toLowerCase()) ||
        a.airport.toLowerCase().includes(input.toLowerCase())
    );
  };

  const handleFromSelect = (city: string, airport: string) => {
    setFromCity(city);
    setFromAirport(airport);
    setFromInput(city);
    setShowFromDropdown(false);
  };

  const handleToSelect = (city: string, airport: string) => {
    setToCity(city);
    setToAirport(airport);
    setToInput(city);
    setShowToDropdown(false);
  };

  const handleSwap = () => {
    const tempCity = fromCity;
    const tempAirport = fromAirport;
    const tempInput = fromInput;

    setFromCity(toCity);
    setFromAirport(toAirport);
    setFromInput(toInput);

    setToCity(tempCity);
    setToAirport(tempAirport);
    setToInput(tempInput);
  };

  const handleViewDetails = (tripId: string) => {
    setSelectedTripForDetail(tripId);
    setDetailDialogOpen(true);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-8 py-6 sm:py-10 px-0 font-montserrat relative z-20">


      {/* Modern Unified Filter Search Panel */}
      <div className="w-full border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 bg-white p-4 sm:p-5 lg:p-4">
        {/*
          Mobile (< lg): 4 Rows Stacked (From -> Swap/To -> Date -> Search Button)
          Laptop & Desktop (lg & xl): Single Unified Line Toolbar
        */}
        <div className="w-full flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-0 relative">

          {/* ROW 1 (Mobile) / COL 1 (Desktop): FROM INPUT */}
          <div className="w-full lg:flex-[1.2] relative z-40">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block lg:hidden">
              From
            </Label>
            <div className="w-full relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 pointer-events-none z-10" />
              <Input
                type="text"
                value={fromInput}
                onChange={(e) => {
                  setFromInput(e.target.value);
                  setFromCity(e.target.value);
                  setShowFromDropdown(true);
                }}
                onFocus={() => setShowFromDropdown(true)}
                placeholder="Departure city..."
                className="w-full h-14 lg:h-[68px] rounded-xl lg:rounded-l-2xl lg:rounded-r-none border-slate-200 pl-11 pr-4 text-base font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:z-20 transition-all shadow-2xs"
              />
              {fromAirport && (
                <div className="absolute bottom-2 left-11 text-[11px] text-slate-400 font-medium truncate max-w-[75%] pointer-events-none z-10">
                  {fromAirport}
                </div>
              )}
              {showFromDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-100">
                  {getFilteredAirports(fromInput).map((airport) => (
                    <div
                      key={airport.city}
                      onClick={() => handleFromSelect(airport.city, airport.airport)}
                      className="px-4 py-3 hover:bg-amber-50/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Plane className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <div className="font-bold text-sm text-slate-800">{airport.city}</div>
                          <div className="text-xs text-slate-500">{airport.airport}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SWAP BUTTON (Overlaps on desktop, centered between inputs on mobile) */}
          <div className="relative z-40 flex justify-center -my-2 lg:my-0 lg:-mx-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full h-9 w-9 lg:h-10 lg:w-10 border-2 border-slate-200 bg-white hover:bg-amber-500 hover:text-white hover:border-amber-500 text-slate-600 shadow-md transition-all duration-300"
              onClick={handleSwap}
              title="Swap Locations"
            >
              <ArrowUpDown className="w-4 h-4 lg:rotate-90 transition-transform" />
            </Button>
          </div>

          {/* ROW 2 (Mobile) / COL 2 (Desktop): TO INPUT */}
          <div className="w-full lg:flex-[1.2] relative z-30">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block lg:hidden">
              To
            </Label>
            <div className="w-full relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 pointer-events-none z-10" />
              <Input
                type="text"
                value={toInput}
                onChange={(e) => {
                  setToInput(e.target.value);
                  setToCity(e.target.value);
                  setShowToDropdown(true);
                }}
                onFocus={() => setShowToDropdown(true)}
                placeholder="Destination city..."
                className="w-full h-14 lg:h-[68px] rounded-xl lg:rounded-none border-slate-200 lg:border-l-0 pl-11 pr-4 text-base font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:z-20 transition-all shadow-2xs"
              />
              {toAirport && (
                <div className="absolute bottom-2 left-11 text-[11px] text-slate-400 font-medium truncate max-w-[75%] pointer-events-none z-10">
                  {toAirport}
                </div>
              )}
              {showToDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-100">
                  {getFilteredAirports(toInput).map((airport) => (
                    <div
                      key={airport.city}
                      onClick={() => handleToSelect(airport.city, airport.airport)}
                      className="px-4 py-3 hover:bg-amber-50/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Plane className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <div className="font-bold text-sm text-slate-800">{airport.city}</div>
                          <div className="text-xs text-slate-500">{airport.airport}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ROW 3 (Mobile) / COL 3 (Desktop): DEPARTURE DATE */}
          <div className="w-full lg:flex-1 relative z-20">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block lg:hidden">
              Departure Date
            </Label>
            <div className="w-full relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-14 lg:h-[68px] rounded-xl lg:rounded-none border-slate-200 lg:border-l-0 pl-11 pr-4 text-sm font-semibold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:z-20 transition-all shadow-2xs cursor-pointer"
              />
            </div>
          </div>

          {/* ROW 4 (Mobile) / COL 4 (Desktop): SEARCH ACTION BUTTON */}
          <div className="w-full lg:w-auto shrink-0 relative z-10 mt-1 lg:mt-0">
            <Button
              className="w-full lg:w-auto h-14 lg:h-[68px] font-extrabold px-8 lg:px-10 xl:px-12 text-base bg-amber-500 hover:bg-amber-600 text-white rounded-xl lg:rounded-r-2xl lg:rounded-l-none cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              onClick={fetchTrips}
            >
              <Search className="w-5 h-5 shrink-0" />
              <span>Search</span>
            </Button>
          </div>

        </div>
      </div>

      {/* Trips Result List Section */}
      <div className="w-full">
        <HeadingSection heading="Available Trips" />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 w-full">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-3" />
            <p className="text-slate-500 text-sm font-semibold">Fetching public trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 my-6 w-full">
            <p className="text-slate-600 font-bold text-base">No active public trips found.</p>
            <p className="text-slate-400 text-xs mt-1">Try adjusting your search criteria or departure dates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 my-6 w-full">
            {trips.map((trip) => {
              const traveler = trip.traveler;
              const travelerName = traveler?.name || trip.traveler_email || "Traveler";
              const rating = traveler?.average_rating ?? trip.average_rating ?? 0;
              const totalReviews = traveler?.total_reviews ?? trip.reviews?.length ?? 0;
              const isVerified = traveler?.is_verified ?? false;

              const isTripOwner =
                user &&
                ((user.email && trip.traveler_email && user.email.toLowerCase() === trip.traveler_email.toLowerCase()) ||
                  (user.id && (trip as { user_id?: string }).user_id === user.id) ||
                  (user.id && traveler?.id && user.id === traveler.id));

              return (
                <div
                  key={trip.id}
                  className="group border border-slate-200/80 hover:border-amber-300 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-xl transition-all duration-300 bg-white flex flex-col justify-between overflow-hidden w-full"
                >
                  {/* Card Header: Clickable Traveler Profile Info */}
                  <div
                    onClick={() => handleProfileClick(traveler?.id)}
                    className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-amber-50/40 transition-colors group/header w-full"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        {traveler?.profile_image ? (
                          <Image
                            src={traveler.profile_image}
                            alt={travelerName}
                            width={44}
                            height={44}
                            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-2xs group-hover/header:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-amber-500 text-white font-black text-sm flex items-center justify-center border-2 border-white shadow-2xs group-hover/header:scale-105 transition-transform">
                            {travelerName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {isVerified && (
                          <div
                            className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-2xs"
                            title="Verified Traveler"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-500 stroke-white stroke-[2.5]" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-slate-800 text-sm truncate group-hover/header:text-amber-600 transition-colors">
                          {travelerName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Verified Traveler
                        </span>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black text-slate-800">
                        {Number(rating).toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({totalReviews})
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between w-full">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base line-clamp-1 group-hover:text-amber-600 transition-colors">
                        {trip.title}
                      </h4>
                      {trip.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 italic">
                          &quot;{trip.description}&quot;
                        </p>
                      )}
                    </div>

                    {/* Route Flow Card */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-2 w-full">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          From
                        </span>
                        <span className="font-extrabold text-xs text-slate-800 truncate block">
                          {trip.from_city}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {trip.from_country}
                        </span>
                      </div>

                      <div className="w-7 h-7 rounded-full bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>

                      <div className="min-w-0 flex-1 text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          To
                        </span>
                        <span className="font-extrabold text-xs text-slate-800 truncate block">
                          {trip.to_city}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {trip.to_country}
                        </span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1 w-full">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Travel Dates
                      </span>
                      <span className="font-bold text-slate-800">
                        {formatDate(trip.departure_date)} → {formatDate(trip.arrival_date)}
                      </span>
                    </div>

                    {/* Capacity & Price Metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 w-full">
                      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 w-full">
                        <Luggage className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                            Capacity
                          </span>
                          <span className="text-xs font-black text-slate-800">
                            {trip.available_weight_kg} KG
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/80 w-full">
                        <Coins className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-emerald-600/80 font-semibold block leading-tight">
                            Reward
                          </span>
                          <span className="text-xs font-black text-emerald-700">
                            ${trip.reward_per_kg}/kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-2 w-full">
                    <Button
                      variant="outline"
                      className="w-full font-bold text-xs border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl h-10"
                      onClick={() => handleViewDetails(trip.id)}
                    >
                      Details
                    </Button>
                    <Button
                      disabled={Boolean(isTripOwner) || user?.role !== "SENDER" || requestingTripId === trip.id || requestedTripIds.has(trip.id)}
                      className="w-full font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-10 shadow-2xs disabled:opacity-50"
                      onClick={() => handleBookingRequest(trip)}
                    >
                      {requestedTripIds.has(trip.id) ? (
                        "Request Sent"
                      ) : requestingTripId === trip.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Requesting...
                        </>
                      ) : isTripOwner ? (
                        "Your Trip"
                      ) : user?.role !== "SENDER" ? (
                        "Sender Only"
                      ) : (
                        "Request"
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trip Details Dialog */}
      <TripDetailDialog
        tripId={selectedTripForDetail}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        canRequestBooking={user?.role === "SENDER"}
        onRequestBooking={(trip) => handleBookingRequest(trip)}
      />

      <SendRequestDialog
        setOpen={(open) => {
          setRequestDialogOpen(open);
          if (!open) setRequestingTripId(null);
        }}
        trip={requestDialogOpen ? selectedTripForRequest : null}
        onSuccess={() => {
          if (selectedTripForRequest?.id) {
            setRequestedTripIds((previous) => {
              const next = new Set(previous);
              next.add(selectedTripForRequest.id);
              return next;
            });
          }
          fetchTrips();
        }}
      />
    </div>
  );
};

export default FindTravelers;
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { TripDetailDialog } from "@/components/ui/TripDetailDialog";
import { SendRequestDialog } from "../sender/find-travellers/SendRequestDialog";

// Auth context & package API
import { useAuth } from "@/context/AuthContext";
import { getMyPackages, APIPackageItem } from "@/api/sender.package.api";

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

  // Track loading per individual trip ID
  const [requestingTripId, setRequestingTripId] = useState<string | null>(null);

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

  // Profile navigation handler
  const handleProfileClick = (travelerId?: string) => {
    if (travelerId) {
      router.push(`/travelers/${travelerId}`);
    }
  };

  // Handle Booking Request Execution
  const handleBookingRequest = async (trip: BackendTrip) => {
    setDetailDialogOpen(false);

    if (!user) {
      router.push(`/login?redirectTo=/find-travelers&action=booking_request`);
      return;
    }

    const travelerId = trip.traveler?.id;
    const isOwner =
      (user.email && trip.traveler_email && user.email.toLowerCase() === trip.traveler_email.toLowerCase()) ||
      (user.id && (trip as { user_id?: string }).user_id === user.id) ||
      (user.id && travelerId && user.id === travelerId);

    if (isOwner) {
      toast.error("You cannot send a booking request for your own trip.");
      return;
    }

    try {
      setRequestingTripId(trip.id);

      const packages: APIPackageItem[] = await getMyPackages();

      const tripFrom = trip.from_city.trim().toLowerCase();
      const tripTo = trip.to_city.trim().toLowerCase();

      const routeMatchingPackages = packages.filter((pkg) => {
        const pkgFrom = pkg.pickup_city?.trim().toLowerCase();
        const pkgTo = pkg.destination_city?.trim().toLowerCase();
        return pkgFrom === tripFrom && pkgTo === tripTo;
      });

      if (routeMatchingPackages.length > 0) {
        const validPackage = routeMatchingPackages.find(
          (pkg) =>
            pkg.status === "PUBLISHED" ||
            pkg.verification_status === "VERIFIED" ||
            pkg.verification_status === "AUTO_APPROVED"
        );

        if (validPackage) {
          setSelectedTripForRequest(trip);
          setRequestDialogOpen(true);
          return;
        }

        const pendingPackage = routeMatchingPackages.find(
          (pkg) =>
            pkg.verification_status === "PENDING" ||
            pkg.verification_status === "MANUAL_REVIEW"
        );

        if (pendingPackage) {
          toast.warning(
            `Your matching package (${trip.from_city} → ${trip.to_city}) is under review. You can request once verified.`
          );
          return;
        }

        const rejectedPackage = routeMatchingPackages.find(
          (pkg) => pkg.verification_status === "REJECTED"
        );

        if (rejectedPackage) {
          toast.error(
            `Your package for ${trip.from_city} → ${trip.to_city} was rejected. Please update it first.`
          );
          router.push("/package-list");
          return;
        }
      }

      toast.info(
        `No package found matching route (${trip.from_city} → ${trip.to_city}). Redirecting to package creation...`
      );
      router.push(
        `/package-list?pickup_city=${encodeURIComponent(trip.from_city)}&destination_city=${encodeURIComponent(trip.to_city)}`
      );

    } catch (error) {
      console.error("Failed to check user packages:", error);
      toast.error("Failed to verify package status. Please try again.");
    } finally {
      setRequestingTripId(null);
    }
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
    <div className="w-full min-w-0 flex flex-col gap-8 py-6 sm:py-10 px-0 font-montserrat">
      <HeadingSection
        heading="Find Public Trips"
        subheading="Search available travelers and request luggage carry services."
      />

      {/* Modern Filter Search Panel */}
      <div className="w-full border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 bg-white p-4 sm:p-6 lg:p-8">
        <div className="w-full relative flex flex-col lg:flex-row items-center gap-4 lg:gap-3">

          {/* FROM INPUT */}
          <div className="w-full flex-1 relative">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">From</Label>
            <div className="w-full relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 pointer-events-none" />
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
                className="w-full h-14 sm:h-[64px] rounded-xl sm:rounded-2xl border-slate-200 pl-11 pr-4 text-base sm:text-lg font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
              />
              {fromAirport && (
                <div className="absolute bottom-2 left-11 text-[11px] text-slate-400 font-medium truncate max-w-[80%]">
                  {fromAirport}
                </div>
              )}
              {showFromDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-100">
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

          {/* SWAP BUTTON */}
          <div className="z-10 my-1 lg:my-0 lg:mt-6 -my-5 lg:-my-0 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full h-11 w-11 sm:h-12 sm:w-12 border-2 border-slate-200 bg-white hover:bg-amber-500 hover:text-white hover:border-amber-500 text-slate-600 shadow-md transition-all duration-300"
              onClick={handleSwap}
              title="Swap Locations"
            >
              <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 lg:rotate-90 transition-transform" />
            </Button>
          </div>

          {/* TO INPUT */}
          <div className="w-full flex-1 relative">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">To</Label>
            <div className="w-full relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500 pointer-events-none" />
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
                className="w-full h-14 sm:h-[64px] rounded-xl sm:rounded-2xl border-slate-200 pl-11 pr-4 text-base sm:text-lg font-bold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
              />
              {toAirport && (
                <div className="absolute bottom-2 left-11 text-[11px] text-slate-400 font-medium truncate max-w-[80%]">
                  {toAirport}
                </div>
              )}
              {showToDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-100">
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

          {/* DEPARTURE DATE */}
          <div className="w-full flex-1 relative">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Departure Date</Label>
            <div className="w-full relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-14 sm:h-[64px] rounded-xl sm:rounded-2xl border-slate-200 pl-11 pr-4 text-sm font-semibold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* SEARCH TRIGGER ACTION */}
        <div className="flex justify-center mt-6 w-full">
          <Button
            className="w-full font-extrabold px-10 sm:px-16 py-6 sm:py-7 text-base sm:text-lg bg-amber-500 hover:bg-amber-600 text-white rounded-xl sm:rounded-2xl cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            onClick={fetchTrips}
          >
            <Search className="w-5 h-5" />
            <span>Search Trips</span>
          </Button>
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
                      disabled={requestingTripId === trip.id || Boolean(isTripOwner)}
                      className="w-full font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-10 shadow-2xs disabled:opacity-50"
                      onClick={() => handleBookingRequest(trip)}
                    >
                      {requestingTripId === trip.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isTripOwner ? (
                        "Your Trip"
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
        onRequestBooking={(trip) => handleBookingRequest(trip)}
      />

      {/* Booking Form Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">Request Booking</DialogTitle>
          </DialogHeader>
          <SendRequestDialog
            setOpen={setRequestDialogOpen}
            trip={selectedTripForRequest}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FindTravelers;
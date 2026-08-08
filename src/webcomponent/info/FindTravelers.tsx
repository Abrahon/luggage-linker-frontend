"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, ArrowUpDown, Plane, Loader2, CheckCircle2, Star, AlertTriangle, PackagePlus, Clock } from "lucide-react";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { BackendTrip, getPublicTripsApi } from "@/api/trip.api";
import { TripDetailDialog } from "@/components/ui/TripDetailDialog";
import { SendRequestDialog } from "../sender/find-travellers/SendRequestDialog";

// Auth context & your actual package API
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
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Dialog Controls for Trips
  const [selectedTripForDetail, setSelectedTripForDetail] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);

  const [selectedTripForRequest, setSelectedTripForRequest] = useState<BackendTrip | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState<boolean>(false);

  // Status Modals Logic
  const [showCreatePackageModal, setShowCreatePackageModal] = useState<boolean>(false);
  const [showPackageStatusModal, setShowPackageStatusModal] = useState<boolean>(false);
  const [showRejectedPackageModal, setShowRejectedPackageModal] = useState<boolean>(false);
  const [bookingMessage, setBookingMessage] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<APIPackageItem | null>(null);

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

  // Handle Flow Execution matching your Django Backend Schema
  const handleBookingRequest = async (trip: BackendTrip) => {
    // 1. Authenticate user check
    if (!user) {
      router.push(`/login?redirectTo=/find-travelers&action=booking_request`);
      return;
    }

    try {
      setActionLoading(true);

      // 2. Fetch Sender Packages using your API
      const packages: APIPackageItem[] = await getMyPackages();

      // Check for active verified / published package
      const readyPackage = packages.find(
        (pkg) =>
          pkg.status === "PUBLISHED" ||
          pkg.verification_status === "VERIFIED" ||
          pkg.verification_status === "AUTO_APPROVED"
      );

      if (readyPackage) {
        setSelectedTripForRequest(trip);
        setRequestDialogOpen(true);
        return;
      }

      // Check for package pending verification or manual review
      const pendingPackage = packages.find(
        (pkg) =>
          pkg.verification_status === "PENDING" ||
          pkg.verification_status === "MANUAL_REVIEW"
      );

      if (pendingPackage) {
        setBookingMessage(
          "Your package is currently under review. You can send a booking request once it has been verified by our team."
        );
        setShowPackageStatusModal(true);
        return;
      }

      // Check for rejected package
      const rejectedPackage = packages.find(
        (pkg) => pkg.verification_status === "REJECTED"
      );

      if (rejectedPackage) {
        setSelectedPackage(rejectedPackage);
        setShowRejectedPackageModal(true);
        return;
      }

      // If user has no package created yet
      setShowCreatePackageModal(true);
    } catch (error) {
      console.error("Failed to check user packages:", error);
    } finally {
      setActionLoading(false);
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

  return (
    <div className="w-full flex flex-col gap-8 py-10 md:px-8 px-4 font-montserrat">
      <HeadingSection
        heading="Find Public Trips"
        subheading="Search available travelers and request luggage carry services."
      />

      {/* Filter Section */}
      <div className="w-full border rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white p-6">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full relative">
            <Label className="text-sm font-semibold mb-2 block">From</Label>
            <div className="relative">
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
                className="h-[70px] rounded-xl border-2 border-gray-300 pl-4 pr-4 text-lg font-semibold focus:border-gray-400 focus:ring-0"
              />
              {fromAirport && (
                <div className="absolute bottom-3 left-4 text-xs text-gray-400">
                  {fromAirport}
                </div>
              )}
              {showFromDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
                  {getFilteredAirports(fromInput).map((airport) => (
                    <div
                      key={airport.city}
                      onClick={() => handleFromSelect(airport.city, airport.airport)}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <Plane className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-semibold text-sm">{airport.city}</div>
                          <div className="text-xs text-gray-500">{airport.airport}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center mb-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 border-2 border-gray-300 hover:bg-gray-100"
              onClick={handleSwap}
            >
              <ArrowUpDown className="w-5 h-5 text-gray-600" />
            </Button>
          </div>

          <div className="flex-1 w-full relative">
            <Label className="text-sm font-semibold mb-2 block">To</Label>
            <div className="relative">
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
                className="h-[70px] rounded-xl border-2 border-gray-300 pl-4 pr-4 text-lg font-semibold focus:border-gray-400 focus:ring-0"
              />
              {toAirport && (
                <div className="absolute bottom-3 left-4 text-xs text-gray-400">
                  {toAirport}
                </div>
              )}
              {showToDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50">
                  {getFilteredAirports(toInput).map((airport) => (
                    <div
                      key={airport.city}
                      onClick={() => handleToSelect(airport.city, airport.airport)}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <Plane className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-semibold text-sm">{airport.city}</div>
                          <div className="text-xs text-gray-500">{airport.airport}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 w-full">
            <Label className="text-sm font-semibold mb-2 block">Departure Date</Label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-[70px] rounded-xl border-2 border-gray-300 pl-12 pr-4 text-sm focus:border-gray-400 focus:ring-0"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Button
            className="font-semibold px-16 py-6 text-lg bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl cursor-pointer"
            onClick={fetchTrips}
          >
            Search
          </Button>
        </div>
      </div>

      {/* Trips Result List */}
      <div className="w-full">
        <HeadingSection heading="Available Trips" />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-2" />
            <p className="text-gray-500 text-sm font-medium">Fetching public trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-gray-50 my-6">
            <p className="text-gray-500 font-semibold">No active public trips found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 my-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="border rounded-2xl shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between p-5"
              >
                <div className="flex justify-between items-center border-b pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-sm truncate max-w-[150px]">
                      👤 {trip.traveler_email || "Verified Traveler"}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-yellow-500 shrink-0">
                    <Star className="w-4 h-4 fill-yellow-500" />
                    <span>4.9</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Plane className="w-4 h-4 text-yellow-500 shrink-0" />
                  <h4 className="font-bold text-slate-800 truncate">{trip.title}</h4>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border flex justify-between items-center mb-3">
                  <div className="text-left">
                    <span className="text-xs text-gray-400 block font-semibold">FROM</span>
                    <span className="font-bold text-sm text-gray-800">{trip.from_city}</span>
                  </div>
                  <span className="text-gray-400 font-bold">→</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block font-semibold">TO</span>
                    <span className="font-bold text-sm text-gray-800">{trip.to_city}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs font-semibold text-gray-600 mb-3 bg-gray-50/50 p-2 rounded-lg">
                  <span className="flex items-center gap-1">
                    📅 {trip.departure_date} → {trip.arrival_date}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm font-bold border-t pt-3 mb-4">
                  <span className="text-gray-700">🧳 {trip.available_weight_kg} KG</span>
                  <span className="text-emerald-600">💰 ${trip.reward_per_kg} / kg</span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 mb-4 italic">
                  &quot;{trip.description}&quot;
                </p>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <Button
                    variant="outline"
                    className="font-semibold text-xs border-gray-300"
                    onClick={() => handleViewDetails(trip.id)}
                  >
                    View Details
                  </Button>
                  <Button
                    disabled={actionLoading}
                    className="font-semibold text-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={() => handleBookingRequest(trip)}
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Booking"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <TripDetailDialog
        tripId={selectedTripForDetail}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onRequestBooking={(trip) => handleBookingRequest(trip)}
      />

      {/* Booking Form Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl">Request Booking</DialogTitle>
          </DialogHeader>
          <SendRequestDialog
            setOpen={setRequestDialogOpen}
            trip={selectedTripForRequest}
          />
        </DialogContent>
      </Dialog>

      {/* ---------------- MODALS FOR PACKAGE STATUSES ---------------- */}

      {/* 1. Create Package Modal (No Package Found) */}
      <Dialog open={showCreatePackageModal} onOpenChange={setShowCreatePackageModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-yellow-500" />
              Package Required
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 pt-3 leading-relaxed">
              You need to create a package before requesting this trip.
              <br /><br />
              Your package must be verified and published by our team first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreatePackageModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
              onClick={() => {
                setShowCreatePackageModal(false);
                router.push("/package-list");
              }}
            >
              Create Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Pending Verification Modal */}
      <Dialog open={showPackageStatusModal} onOpenChange={setShowPackageStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-amber-600">
              <Clock className="w-5 h-5" />
              Package Under Review
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 pt-3 leading-relaxed">
              {bookingMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end pt-4">
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
              onClick={() => setShowPackageStatusModal(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Rejected Package Modal */}
      <Dialog open={showRejectedPackageModal} onOpenChange={setShowRejectedPackageModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Package Rejected
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 pt-3 leading-relaxed">
              Your existing package was rejected during review. Please resolve any issues on your package before attempting to book a trip.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowRejectedPackageModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
              onClick={() => {
                setShowRejectedPackageModal(false);
                router.push("/package-list");
              }}
            >
              Fix Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FindTravelers;
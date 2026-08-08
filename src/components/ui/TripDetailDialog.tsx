"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Weight, DollarSign, MapPin, Plane, AlertCircle } from "lucide-react";
import { BackendTrip, getTripDetailApi } from "@/api/trip.api";

interface TripDetailDialogProps {
  tripId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestBooking: (trip: BackendTrip) => void;
}

export const TripDetailDialog = ({
  tripId,
  open,
  onOpenChange,
  onRequestBooking,
}: TripDetailDialogProps) => {
  const [trip, setTrip] = useState<BackendTrip | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && tripId) {
      setLoading(true);
      setError(null);
      getTripDetailApi(tripId)
        .then((res) => setTrip(res.data))
        .catch((err) => {
          console.error("Failed to load trip details:", err);
          setError("Failed to fetch trip details. Please try again.");
        })
        .finally(() => setLoading(false));
    }
  }, [open, tripId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg font-montserrat">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" />
            Trip Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
            <p className="text-sm text-gray-500">Loading trip details...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 py-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : trip ? (
          <div className="flex flex-col gap-5 pt-2">
            <div>
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-lg font-bold text-gray-900">{trip.title}</h3>
                <Badge variant={trip.status === "PLANNED" ? "default" : "secondary"}>
                  {trip.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">{trip.description}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-400 block uppercase font-semibold">From</span>
                <p className="font-bold text-gray-800 text-base flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-red-500" />
                  {trip.from_city}, {trip.from_country}
                </p>
              </div>
              <Plane className="w-6 h-6 text-yellow-500 rotate-90 md:rotate-0" />
              <div className="text-right">
                <span className="text-xs text-gray-400 block uppercase font-semibold">To</span>
                <p className="font-bold text-gray-800 text-base flex items-center gap-1 justify-end">
                  <MapPin className="w-4 h-4 text-green-500" />
                  {trip.to_city}, {trip.to_country}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border p-3 rounded-lg flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-xs text-gray-400 block">Departure</span>
                  <span className="text-sm font-semibold">{trip.departure_date}</span>
                </div>
              </div>

              <div className="border p-3 rounded-lg flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-xs text-gray-400 block">Arrival</span>
                  <span className="text-sm font-semibold">{trip.arrival_date}</span>
                </div>
              </div>

              <div className="border p-3 rounded-lg flex items-center gap-3">
                <Weight className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-xs text-gray-400 block">Available Space</span>
                  <span className="text-sm font-semibold">
                    {trip.available_weight_kg} / {trip.max_weight_kg} KG
                  </span>
                </div>
              </div>

              <div className="border p-3 rounded-lg flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-xs text-gray-400 block">Reward Rate</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    ${trip.reward_per_kg} / kg ({trip.currency})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                onClick={() => {
                  onOpenChange(false);
                  onRequestBooking(trip);
                }}
              >
                Request Booking
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
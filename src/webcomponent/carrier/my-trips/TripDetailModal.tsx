"use client";

import { useEffect, useState } from "react";
import { BackendTrip, getTripDetailApi } from "@/api/trip.api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Calendar, MapPin, Weight, DollarSign } from "lucide-react";

interface TripDetailModalProps {
  tripId: string | number | null;
  onClose: () => void;
}

export const TripDetailModal = ({ tripId, onClose }: TripDetailModalProps) => {
  const [trip, setTrip] = useState<BackendTrip | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) {
      setTrip(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response: any = await getTripDetailApi(String(tripId));
        
        // Handle nested response bodies safely: response.data, response.result, or raw object
        const extractedData = response?.data || response?.result || response;

        if (extractedData && typeof extractedData === "object" && "title" in extractedData) {
          setTrip(extractedData as BackendTrip);
        } else {
          throw new Error("Invalid trip data structure received from server.");
        }
      } catch (err: any) {
        console.error("Trip detail fetch error:", err);
        setError(err.response?.data?.message || err.message || "Failed to load trip details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [tripId]);

  return (
    <Dialog open={!!tripId} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-6 bg-white shadow-2xl border border-slate-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            {loading ? "Loading Trip..." : trip?.title || "Trip Details"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs border border-red-100">
            {error}
          </div>
        ) : trip ? (
          <div className="flex flex-col gap-4 text-xs text-slate-600 pt-2">
            <div className="flex items-center gap-2 text-slate-800 font-medium bg-slate-50 p-3 rounded-xl">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                {trip.from_city || "N/A"}, {trip.from_country || "N/A"} &rarr; {trip.to_city || "N/A"}, {trip.to_country || "N/A"}
              </span>
            </div>

            <p className="text-slate-500 leading-relaxed">
              {trip.description || "No description provided."}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 border border-slate-100 p-2.5 rounded-xl">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Departure</div>
                  <div className="font-semibold text-slate-700">{trip.departure_date || "N/A"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 border border-slate-100 p-2.5 rounded-xl">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Arrival</div>
                  <div className="font-semibold text-slate-700">{trip.arrival_date || "N/A"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 border border-slate-100 p-2.5 rounded-xl">
                <Weight className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Available Weight</div>
                  <div className="font-semibold text-slate-700">{trip.available_weight_kg ?? 0} kg</div>
                </div>
              </div>

              <div className="flex items-center gap-2 border border-slate-100 p-2.5 rounded-xl">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Reward / kg</div>
                  <div className="font-semibold text-slate-700">
                    {trip.reward_per_kg ?? 0} {trip.currency || "USD"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
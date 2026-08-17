"use client";

import React from "react";
import { BackendTrip } from "@/api/trip.api";
import { MatchItem } from "@/api/matching.api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SendRequestDialog } from "../find-travellers/SendRequestDialog";

interface MatchRequestModalProps {
  isOpen: boolean;
  match: MatchItem | null;
  onClose: () => void;
}

export const MatchRequestModal: React.FC<MatchRequestModalProps> = ({
  isOpen,
  match,
  onClose,
}) => {
  if (!match) return null;

  // Safe numerical parsing for string-based decimal API fields
  const pricePerKg = parseFloat(match.reward_per_kg || "0");
  const capacityKg = parseFloat(match.remaining_weight || "0");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-montserrat p-6">
        <DialogHeader className="pb-3 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-slate-900">
            Send Booking Request to {match.traveler_name}
          </DialogTitle>
          <p className="text-xs text-slate-500 mt-1">
            Matching package:{" "}
            <span className="font-semibold text-slate-700">
              {match.package_title}
            </span>
          </p>
        </DialogHeader>

        <div className="pt-4">
          <SendRequestDialog
            setOpen={(openState: boolean) => {
              if (!openState) onClose();
            }}
            trip={
              {
                id: match.trip,
                title: match.trip_title,
                description: "",
                from_country: match.traveler_from_country,
                from_city: match.traveler_from_city,
                to_country: match.traveler_to_country,
                to_city: match.traveler_to_city,
                departure_date: match.departure_date,
                arrival_date: match.arrival_date,
                max_weight_kg: capacityKg,
                available_weight_kg: capacityKg,
                reward_per_kg: pricePerKg,
                currency: match.currency || "USD",
                status: match.trip_status || "PLANNED",
                is_active: match.is_active,
                is_public: true,
              } as BackendTrip
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
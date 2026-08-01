"use client";

import React from "react";
// import { SendRequestDialog } from "@/webcomponent/sender/find-travellers"; 
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
            open={isOpen}
            from={`${match.traveler_from_city}, ${match.traveler_from_country}`}
            to={`${match.traveler_to_city}, ${match.traveler_to_country}`}
            date={match.departure_date}
            returnDate={match.arrival_date}
            price={pricePerKg}
            transportType="Flight"
            luggageSpace={capacityKg}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
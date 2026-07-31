"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Package, MapPin, Mail, Scale, DollarSign, ExternalLink, Calendar } from "lucide-react";

interface SenderDilogCardProps {
  id: string;
  trackingNumber: string;
  packageTitle: string;
  tripTitle: string;
  fromCity: string;
  fromCountry: string;
  toCity: string;
  toCountry: string;
  weightKg: string;
  reward: string;
  currency: string;
  status: string;
  paymentStatus: string;
  escrowStatus: string;
  senderEmail: string;
  travelerEmail: string;
  packageImage: string | null;
  createdAt: string;
}

export const SenderDilogCard = ({
  id,
  trackingNumber,
  packageTitle,
  tripTitle,
  fromCity,
  fromCountry,
  toCity,
  toCountry,
  weightKg,
  reward,
  currency,
  status,
  paymentStatus,
  escrowStatus,
  senderEmail,
  travelerEmail,
  packageImage,
  createdAt,
}: SenderDilogCardProps) => {
  const router = useRouter();

  const handleTrack = () => {
    router.push(`/dashboard/sender/track/${trackingNumber}`);
  };

  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* Package Header & Tracking */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">{packageTitle}</h3>
          <p className="text-xs font-medium text-slate-500">{tripTitle}</p>
        </div>
        <span className="font-mono text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
          {trackingNumber}
        </span>
      </div>

      {/* Package Image Banner */}
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
        {packageImage ? (
          <Image
            src={packageImage}
            alt={packageTitle}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <Package className="w-8 h-8 mb-1" />
            <span className="text-xs">No Image Available</span>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Route */}
        <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">From</p>
              <p className="font-semibold text-slate-800">{fromCity}, {fromCountry}</p>
            </div>
          </div>
          <span className="text-slate-300 font-bold">→</span>
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">To</p>
              <p className="font-semibold text-slate-800">{toCity}, {toCountry}</p>
            </div>
          </div>
        </div>

        {/* Weight */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Weight</p>
            <p className="font-semibold text-slate-800">{weightKg} kg</p>
          </div>
        </div>

        {/* Reward */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Reward</p>
            <p className="font-semibold text-slate-800">{reward} {currency}</p>
          </div>
        </div>

        {/* Traveler Email */}
        <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
          <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Traveler Contact</p>
            <p className="font-semibold text-slate-800 truncate">{travelerEmail || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Badges Row */}
      <div className="flex flex-wrap gap-2 text-[10px] font-bold">
        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
          STATUS: {status}
        </span>
        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
          PAYMENT: {paymentStatus}
        </span>
        <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full border border-purple-200">
          ESCROW: {escrowStatus}
        </span>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Button
          onClick={handleTrack}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-2 py-2.5 rounded-xl transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Track Delivery</span>
        </Button>
      </div>
    </div>
  );
};
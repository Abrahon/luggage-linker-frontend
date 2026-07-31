"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { Button } from "@/components/ui/button";
import { SenderCard } from "../card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deliveryApi, BookingData } from "@/api/booking.api"; 
import { Loader2, ExternalLink, PackageX, MapPin, Scale, DollarSign, Mail, Eye } from "lucide-react";

export const SenderActiveDelivaries = () => {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveDeliveries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await deliveryApi.getActiveDeliveries();
      setDeliveries(response.results || []);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err.message || "Failed to load active deliveries."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveDeliveries();
  }, [fetchActiveDeliveries]);

  const handleTrackClick = (trackingNumber: string) => {
    router.push(`/dashboard/sender/track/${trackingNumber}`);
  };

  return (
    <div className="py-12 flex flex-col gap-6 md:px-6 px-4">
      <HeadingSection
        heading="Active Deliveries"
        subheading="See all active deliveries"
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
          <p className="text-xs font-semibold">Loading active deliveries...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchActiveDeliveries}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && deliveries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
          <PackageX className="w-10 h-10 stroke-1" />
          <p className="text-xs font-medium">No active deliveries found.</p>
        </div>
      )}

      {/* Active Deliveries Grid */}
      {!isLoading && !error && deliveries.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {deliveries.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between border border-slate-200/80 rounded-2xl p-4 bg-white shadow-sm hover:shadow-md transition-all gap-4"
            >
              {/* Card Details */}
              <SenderCard
                from={`${item.route.from_city}, ${item.route.from_country}`}
                to={`${item.route.to_city}, ${item.route.to_country}`}
                date={new Date(item.created_at).toLocaleDateString()}
                name={item.package_title}
                weight={parseFloat(item.agreed_weight_kg) || 0}
                price={parseFloat(item.agreed_reward) || 0}
                status={item.status}
                note={item.trip_title}
              />

              {/* Clean Action Buttons Bar */}
              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
                {/* View Modal Trigger */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View</span>
                    </Button>
                  </DialogTrigger>

                  {/* Clean Modal Popup */}
                  <DialogContent className="max-w-md p-6 rounded-2xl font-sans">
                    <DialogHeader className="pb-2 border-b border-slate-100">
                      <div className="flex items-center justify-between pr-4">
                        <DialogTitle className="text-base font-bold text-slate-900">
                          {item.package_title}
                        </DialogTitle>
                        <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {item.tracking_number}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{item.trip_title}</p>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 py-2">
                      {/* Image Preview */}
                      {item.package_image ? (
                        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                          <Image
                            src={item.package_image}
                            alt={item.package_title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-full h-24 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-xs">
                          No Package Image Available
                        </div>
                      )}

                      {/* Route Info */}
                      <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Origin</p>
                            <p className="font-semibold text-slate-800">{item.route.from_city}, {item.route.from_country}</p>
                          </div>
                        </div>
                        <span className="text-slate-300 font-bold">→</span>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Destination</p>
                          <p className="font-semibold text-slate-800">{item.route.to_city}, {item.route.to_country}</p>
                        </div>
                      </div>

                      {/* Weight & Price Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                          <Scale className="w-4 h-4 text-blue-500 shrink-0" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Weight</p>
                            <p className="font-semibold text-slate-800">{item.agreed_weight_kg} kg</p>
                          </div>
                        </div>

                        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Reward</p>
                            <p className="font-semibold text-slate-800">{item.agreed_reward} {item.currency}</p>
                          </div>
                        </div>
                      </div>

                      {/* Traveler Contact */}
                      <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 text-xs">
                        <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Traveler Contact</p>
                          <p className="font-semibold text-slate-800 truncate">{item.traveler_email || "N/A"}</p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200/60">
                          {item.status}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200/60">
                          {item.payment_status}
                        </span>
                        {item.escrow_status && (
                          <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md border border-purple-200/60">
                            ESCROW: {item.escrow_status}
                          </span>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Primary Track Button */}
                <Button
                  onClick={() => handleTrackClick(item.tracking_number)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <span>Message</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
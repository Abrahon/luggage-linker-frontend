"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deliveryApi, BookingData } from "@/api/booking.api"; 
import { Loader2, PackageX, MapPin, Scale, DollarSign, Mail, Eye, ArrowRight } from "lucide-react";

export const SenderActiveDelivaries = () => {
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

  return (
    <div className="py-12 flex flex-col gap-6 md:px-6 px-4">
      <HeadingSection
        heading="Active Deliveries"
        subheading="See all active deliveries in a detailed overview"
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

      {/* Active Deliveries Table */}
      {!isLoading && !error && deliveries.length > 0 && (
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Package Info</th>
                <th className="py-3.5 px-4">Route</th>
                <th className="py-3.5 px-4">Weight & Reward</th>
                <th className="py-3.5 px-4">Booking Status</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {deliveries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Package & Tracking */}
                  <td className="py-4 px-4 font-medium">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-900">{item.package_title}</span>
                      <span className="font-mono text-[10px] font-semibold text-slate-500">
                        TRK: {item.tracking_number}
                      </span>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                      <span>{item.route.from_city}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>{item.route.to_city}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {item.route.from_country} → {item.route.to_country}
                    </span>
                  </td>

                  {/* Weight & Reward */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-900">
                        {item.agreed_reward} {item.currency}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {item.agreed_weight_kg} kg
                      </span>
                    </div>
                  </td>

                  {/* Booking Status */}
                  <td className="py-4 px-4">
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-md border border-blue-200/60 uppercase">
                      {item.status}
                    </span>
                  </td>

                  {/* Payment Status */}
                  <td className="py-4 px-4">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-200/60 uppercase">
                      {item.payment_status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>

                  {/* View Modal Trigger Action */}
                  <td className="py-4 px-4 text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs h-8 px-3 rounded-lg flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Details</span>
                        </Button>
                      </DialogTrigger>

                      {/* Modal Details */}
                      <DialogContent className="max-w-md p-6 rounded-2xl font-sans bg-white">
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
                                <p className="font-semibold text-slate-800">
                                  {item.route.from_city}, {item.route.from_country}
                                </p>
                              </div>
                            </div>
                            <span className="text-slate-300 font-bold">→</span>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Destination</p>
                              <p className="font-semibold text-slate-800">
                                {item.route.to_city}, {item.route.to_country}
                              </p>
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
                                <p className="font-semibold text-slate-800">
                                  {item.agreed_reward} {item.currency}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Traveler Contact */}
                          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2 text-xs">
                            <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Traveler Contact</p>
                              <p className="font-semibold text-slate-800 truncate">
                                {item.traveler_email || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Status Badges */}
                          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200/60">
                              BOOKING: {item.status}
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200/60">
                              PAYMENT: {item.payment_status}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
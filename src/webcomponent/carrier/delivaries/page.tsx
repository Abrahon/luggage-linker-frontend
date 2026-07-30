"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BookingData, deliveryApi } from "@/api/booking.api";
import { DeliveryCard } from "./DelivaryCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const ActiveDeliveries = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeDeliveries, setActiveDeliveries] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchActiveDeliveries = async () => {
    try {
      setIsLoading(true);
      const data = await deliveryApi.getActiveDeliveries();
      const results = data.results ? data.results : (data as unknown as BookingData[]);
      setActiveDeliveries(results);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to load active deliveries.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchActiveDeliveries();
    }
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div className="py-12 flex flex-col gap-6 max-w-6xl mx-auto px-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Active Deliveries</h1>
        <p className="text-sm text-gray-500">Manage all your ongoing delivery workflows.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading active deliveries...</p>
        </div>
      ) : activeDeliveries.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-gray-50 text-gray-500 text-sm">
          No active deliveries found at this moment.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {activeDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="flex flex-col justify-between gap-4 border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all bg-white"
            >
              <DeliveryCard data={delivery} />
              <div className="pt-2 border-t">
                <Link href={`/booking/${delivery.id}`} className="w-full block">
                  <Button className="w-full text-xs font-semibold" variant="outline">
                    View Details & Workflow
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
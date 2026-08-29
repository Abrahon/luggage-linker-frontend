"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BookingData, deliveryApi } from "@/api/booking.api";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { DeliveryCard } from "./DelivaryCard";
import { AcceptDeliveryDialog } from "./AcceptDeliveryDialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const ActiveDelivaries = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeDeliveries, setActiveDeliveries] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedDelivery, setSelectedDelivery] =
    useState<BookingData | null>(null);

  // 1. Mark component as mounted on the client to prevent SSR hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Fetch active deliveries
  const fetchActiveDeliveries = async () => {
    try {
      setIsLoading(true);
      const data = await deliveryApi.getActiveDeliveries();
      const results = data.results
        ? data.results
        : (data as unknown as BookingData[]);
      setActiveDeliveries(results);
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Failed to load active deliveries."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchActiveDeliveries();
    }
  }, [isMounted]);

  // 3. Return null until client hydration finishes
  if (!isMounted) {
    return null;
  }

  const handleViewDetails = (delivery: BookingData) => {
    setSelectedDelivery(delivery);
    setOpenDialog(true);
  };

  const handleBookingUpdated = () => {
    fetchActiveDeliveries();
  };

  return (
    <div className="flex flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <HeadingSection
        heading="Active Deliveries"
        subheading="Review and manage all ongoing delivery requests in progress."
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Loading active deliveries...</p>
        </div>
      ) : activeDeliveries.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-gray-50 text-gray-500">
          No active deliveries found at this moment.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {activeDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="flex flex-col justify-between gap-4 border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all bg-white"
            >
              <DeliveryCard data={delivery} />
              <div className="flex gap-2 justify-center pt-2 border-t">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleViewDetails(delivery)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDelivery && (
        <AcceptDeliveryDialog
          open={openDialog}
          setOpen={setOpenDialog}
          delivery={selectedDelivery}
          onBookingUpdated={handleBookingUpdated}
        />
      )}
    </div>
  );
};
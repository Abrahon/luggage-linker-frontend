"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BookingData, deliveryApi } from "@/api/booking.api";
import { CompleteDilog } from "./CompleteDilog";
import { Breadcrumb } from "@/webcomponent/reusable";
import { statusStyles } from "@/lib/statusColor";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowRight, Eye, PackageCheck } from "lucide-react";

export const CompleteDelivaries = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [completedDeliveries, setCompletedDeliveries] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedDelivery, setSelectedDelivery] = useState<BookingData | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchCompletedDeliveries = async () => {
    try {
      setIsLoading(true);
      const res = await deliveryApi.getCompletedDeliveries();
      setCompletedDeliveries(res.data || []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to fetch completed deliveries."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchCompletedDeliveries();
    }
  }, [isMounted]);

  if (!isMounted) return null;

  // Calculate total earnings dynamically
  const totalEarnings = completedDeliveries.reduce((sum, item) => {
    const reward = parseFloat(item.agreed_reward) || 0;
    return sum + reward;
  }, 0);

  const currencySymbol = completedDeliveries[0]?.currency || "USD";

  const handleViewSummary = (delivery: BookingData) => {
    setSelectedDelivery(delivery);
    setOpenDialog(true);
  };

  return (
    <div className="py-16 flex flex-col gap-6 md:px-6 px-4">
      <Breadcrumb
        title="Completed Trips"
        subtitle="Review all your completed deliveries and earnings history"
        math={[
          {
            mhki: `${currencySymbol} $${totalEarnings.toFixed(2)}`,
            mhki_subtitle: "Total Earnings",
          },
        ]}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Loading completed deliveries...</p>
        </div>
      ) : completedDeliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 border rounded-2xl bg-gray-50 text-gray-500 gap-2">
          <PackageCheck className="w-10 h-10 text-gray-400" />
          <p className="font-semibold text-gray-700">No completed trips found</p>
          <p className="text-xs text-gray-400">
            When you complete deliveries, they will appear here.
          </p>
        </div>
      ) : (
        <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-semibold text-gray-700">Tracking No.</TableHead>
                <TableHead className="font-semibold text-gray-700">Package Title</TableHead>
                <TableHead className="font-semibold text-gray-700">Route</TableHead>
                <TableHead className="font-semibold text-gray-700">Sender</TableHead>
                <TableHead className="font-semibold text-gray-700">Reward</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedDeliveries.map((delivery) => {
                const currentStyle =
                  (statusStyles && statusStyles[delivery.status]) || {
                    label: delivery.status,
                    bg: "bg-emerald-50",
                    text: "text-emerald-700",
                    border: "border-emerald-200",
                  };

                const dateStr = delivery.created_at
                  ? new Date(delivery.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A";

                return (
                  <TableRow key={delivery.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-mono text-xs text-gray-500">
                      {delivery.tracking_number}
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-gray-900">{delivery.package_title}</div>
                      <div className="text-xs text-gray-400">{dateStr}</div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <span>{delivery.route?.from_city}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{delivery.route?.to_city}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {delivery.route?.from_country} → {delivery.route?.to_country}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-gray-700">
                      {delivery.sender_name}
                    </TableCell>

                    <TableCell className="font-semibold text-emerald-600">
                      {delivery.currency} ${delivery.agreed_reward}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border}`}
                      >
                        {currentStyle.label || delivery.status}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => handleViewSummary(delivery)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Summary
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedDelivery && (
        <CompleteDilog
          open={openDialog}
          setOpen={setOpenDialog}
          delivery={selectedDelivery}
        />
      )}
    </div>
  );
};

export default CompleteDelivaries;
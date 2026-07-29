"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BookingData, deliveryApi } from "@/api/booking.api";
import { CanceledDialog } from "./CanceledDilog";
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
import { Loader2, ArrowRight, Eye, XCircle } from "lucide-react";

export const CanceledDeliveries = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [canceledDeliveries, setCanceledDeliveries] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedDelivery, setSelectedDelivery] = useState<BookingData | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchCanceledDeliveries = async () => {
    try {
      setIsLoading(true);
      const res = await deliveryApi.getCancelledDeliveries();
      setCanceledDeliveries(res.data || []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load canceled deliveries."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted) {
      fetchCanceledDeliveries();
    }
  }, [isMounted]);

  if (!isMounted) return null;

  const handleViewDetails = (delivery: BookingData) => {
    setSelectedDelivery(delivery);
    setOpenDialog(true);
  };

  return (
    <div className="py-16 flex flex-col gap-6 md:px-6 px-4">
      <Breadcrumb
        title="Canceled Deliveries"
        subtitle="Review all canceled booking requests and refusal logs"
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Loading canceled deliveries...</p>
        </div>
      ) : canceledDeliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 border rounded-2xl bg-gray-50 text-gray-500 gap-2">
          <XCircle className="w-10 h-10 text-gray-400" />
          <p className="font-semibold text-gray-700">No canceled deliveries found</p>
          <p className="text-xs text-gray-400">
            Canceled booking requests will be logged here for your records.
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
                <TableHead className="font-semibold text-gray-700">Escrow / Refund</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {canceledDeliveries.map((delivery) => {
                const currentStyle =
                  (statusStyles && statusStyles[delivery.status]) || {
                    label: "Cancelled",
                    bg: "bg-red-50",
                    text: "text-red-700",
                    border: "border-red-200",
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

                    <TableCell>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 border">
                        {delivery.escrow_status || "NOT_FUNDED"}
                      </span>
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
                        onClick={() => handleViewDetails(delivery)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
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
        <CanceledDialog
          open={openDialog}
          setOpen={setOpenDialog}
          delivery={selectedDelivery}
        />
      )}
    </div>
  );
};

export default CanceledDeliveries;
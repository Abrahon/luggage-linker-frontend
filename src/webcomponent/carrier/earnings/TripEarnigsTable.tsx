"use client";

import { useState, useEffect } from "react";
import { BookingData } from "@/api/booking.api";
import { DelivaryData } from "@/interface/DelivaryData";
import { AcceptDeliveryDialog } from "../delivaries/AcceptDeliveryDialog";
import { CompleteDilog } from "../delivaries/CompleteDilog";
import { statusStyles } from "@/lib/statusColor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlaneTakeoff, Scale, DollarSign, Eye, Loader2 } from "lucide-react";

export const TripEarnigsTable = () => {
  const [deliveries, setDeliveries] = useState<DelivaryData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DelivaryData | null>(
    null
  );

  // Fetch data from backend API
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

        // Adjust API endpoint to your backend route
        const response = await fetch(`${baseUrl}/api/deliveries/`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load delivery earnings data.");
        }

        const data = await response.json();
        setDeliveries(Array.isArray(data) ? data : data.results || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch deliveries.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const handleView = (delivery: DelivaryData) => {
    setSelectedDelivery(delivery);
    setOpenDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 border border-red-200 rounded-2xl w-full">
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm w-full">
        <p className="text-sm font-medium">No trip earnings or deliveries found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto max-md:max-w-[85vw]">
        <Table className="bg-white">
          <TableHeader className="bg-gray-50/70 border-b border-gray-100">
            <TableRow>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4 pl-5">
                Route Parameters
              </TableHead>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">
                Luggage Weight
              </TableHead>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">
                Rate Space Cost
              </TableHead>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">
                Status
              </TableHead>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4 pr-5 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {deliveries.map((delivery) => {
              const style = statusStyles[delivery.status] || {
                bg: "bg-gray-100",
                text: "text-gray-700",
                label: delivery.status,
              };

              return (
                <TableRow 
                  key={delivery.delivaryId} 
                  className="hover:bg-gray-50/40 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  {/* Route Mapping Column */}
                  <TableCell className="align-middle py-4 pl-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 text-slate-500 rounded-xl hidden sm:block border border-slate-100/50">
                        <PlaneTakeoff className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900 font-mono tracking-wide">
                          {delivery.tripData?.from} → {delivery.tripData?.to}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400 mt-0.5">
                          {typeof delivery.tripData?.date === "string" && delivery.tripData.date}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Luggage Weight Column */}
                  <TableCell className="align-middle py-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                      <Scale className="w-3.5 h-3.5 text-gray-400" />
                      <span>{delivery.tripData?.carryWeight} kg</span>
                    </div>
                  </TableCell>

                  {/* Rate Cost Column */}
                  <TableCell className="align-middle py-4">
                    <div className="flex items-center gap-0.5 text-xs font-extrabold text-slate-900">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 -mr-0.5" />
                      <span>{delivery.tripData?.price}</span>
                    </div>
                  </TableCell>

                  {/* Status Badges Column */}
                  <TableCell className="align-middle py-4">
                    <div
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide w-fit border shadow-sm uppercase ${style.bg} ${style.text}`}
                      style={{ borderColor: "rgba(0,0,0,0.02)" }}
                    >
                      {style.label}
                    </div>
                  </TableCell>

                  {/* Action Button */}
                  <TableCell className="align-middle py-4 pr-5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold px-3 h-8 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 rounded-lg transition-all shadow-sm flex items-center gap-1.5 ml-auto cursor-pointer"
                      onClick={() => handleView(delivery)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* ----------- DIALOGS MAPPING OVERLAYS ----------- */}
        {selectedDelivery && selectedDelivery.status !== "completed" ? (
          <AcceptDeliveryDialog
            open={openDialog}
            setOpen={setOpenDialog}
            delivery={selectedDelivery as unknown as BookingData}
            showCheckbox={selectedDelivery.status === "pending"}
          />
        ) : (
          selectedDelivery && (
            <CompleteDilog
              open={openDialog}
              setOpen={setOpenDialog}
              delivery={selectedDelivery as unknown as BookingData}
            />
          )
        )}
      </div>
    </div>
  );
};
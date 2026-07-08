"use client";
import { TripDetails } from "@/interface/Trip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewTrip } from "./NewTrip";
import { TripCard } from "./TripCard";
import { Plus } from "lucide-react";

export const tripsData: TripDetails[] = [
  { tripId: 1, from: "Dhaka", to: "Singapore", date: "18 Oct 2025", carryWeight: 15, note: "Laptop accessories delivery" },
  { tripId: 2, from: "Chittagong", to: "Dubai", date: "22 Oct 2025", carryWeight: 20, note: "Fragile cargo handling" },
  { tripId: 3, from: "Sylhet", to: "Kolkata", date: "25 Oct 2025", carryWeight: 10, note: "Clothing shipment" },
  { tripId: 4, from: "Dhaka", to: "London", date: "30 Oct 2025", carryWeight: 25, note: "Gift parcel and documents" },
];

export const MyTrips = () => {
  const [openDilog, setOpenDilog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripDetails | null>(null);

  const handleOpenAddModal = () => {
    setSelectedTrip(null); // Clear editing states for a new record entry
    setOpenDilog(true);
  };

  const handleOpenEditModal = (trip: TripDetails) => {
    setSelectedTrip(trip); // Cache target record info context
    setOpenDilog(true);
  };

  return (
    <div className="flex flex-col gap-8 py-10 md:px-8 px-4 bg-slate-50/30 min-h-screen text-slate-900 antialiased">
      
      {/* Action Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Your Scheduled Operations</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage weight limits, routing payloads, and dispatch tracks</p>
        </div>
        
        <Dialog open={openDilog} onOpenChange={setOpenDilog}>
          <Button 
            onClick={handleOpenAddModal}
            className="w-full sm:w-fit bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add new Trip
          </Button>
          
          <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 bg-white shadow-2xl border border-slate-100">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-900">
                {selectedTrip ? `Modify Trip #TRP-102${selectedTrip.tripId}` : "Add New Trip"}
              </DialogTitle>
            </DialogHeader>
            
            {/* NewTrip handles both empty inputs and active populated states seamlessly */}
            <NewTrip setOpenDilog={setOpenDilog} initialData={selectedTrip} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Responsive Grid Deck */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tripsData.map((trip) => (
          <TripCard 
            key={trip.tripId} 
            {...trip} 
            onEditClick={handleOpenEditModal} 
          />
        ))}
      </div>
      
    </div>
  );
};
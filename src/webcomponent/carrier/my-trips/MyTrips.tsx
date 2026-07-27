


"use client";

import { useEffect, useState, useCallback } from "react";
import { getMyTripsApi, type BackendTrip } from "@/api/trip.api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NewTrip } from "./NewTrip";
import { TripCard } from "./TripCard";
import { TripDetailModal } from "./TripDetailModal";
import { Plus, Loader2 } from "lucide-react";

export const MyTrips = () => {
  const [trips, setTrips] = useState<BackendTrip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedTripForEdit, setSelectedTripForEdit] = useState<BackendTrip | null>(null);
  const [selectedTripIdForView, setSelectedTripIdForView] = useState<string | null>(null);

  // API Call: Fetch list via getMyTripsApi
  const fetchMyTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result: any = await getMyTripsApi();
      
      // Safely extract array regardless of payload wrapping (data, results, or raw array)
      if (Array.isArray(result)) {
        setTrips(result);
      } else if (Array.isArray(result?.data)) {
        setTrips(result.data);
      } else if (Array.isArray(result?.results)) {
        setTrips(result.results);
      } else {
        setTrips([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch trips.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTrips();
  }, [fetchMyTrips]);

  const handleOpenAddModal = () => {
    setSelectedTripForEdit(null);
    setOpenDialog(true);
  };

  const handleOpenEditModal = (trip: BackendTrip) => {
    setSelectedTripForEdit(trip);
    setOpenDialog(true);
  };

  const handleDialogChange = (open: boolean) => {
    setOpenDialog(open);
    if (!open) {
      setSelectedTripForEdit(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 py-10 md:px-8 px-4 bg-slate-50/30 min-h-screen text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Your Scheduled Operations</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage weight limits, routing payloads, and dispatch tracks</p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="w-full sm:w-fit bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add new Trip
        </Button>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 bg-white shadow-2xl border border-slate-100">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg font-bold tracking-tight text-slate-900">
              {selectedTripForEdit ? `Edit Trip: ${selectedTripForEdit.title}` : "Add New Trip"}
            </DialogTitle>
          </DialogHeader>

          <NewTrip
            setOpenDialog={setOpenDialog}
            initialData={selectedTripForEdit}
            onSuccess={fetchMyTrips}
          />
        </DialogContent>
      </Dialog>

      {/* View Detail Modal */}
      <TripDetailModal
        tripId={selectedTripIdForView}
        onClose={() => setSelectedTripIdForView(null)}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs border border-red-100">
          {error}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-sm">
          No trips found. Click "Add new Trip" to get started.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onEditClick={handleOpenEditModal}
              onViewClick={(id) => setSelectedTripIdForView(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
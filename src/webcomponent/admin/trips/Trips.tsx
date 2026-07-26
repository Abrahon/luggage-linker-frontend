"use client";

import { useEffect, useState, useCallback } from "react";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  XCircle,
  Loader2,
  Plane,
  Calendar,
  Weight,
  DollarSign,
  User,
  Globe,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAdminTripsApi,
  getAdminTripDetailApi,
  cancelAdminTripApi,
  BackendTrip as ApiBackendTrip,
} from "@/api/trip.api";

export interface ExtendedBackendTrip extends Omit<ApiBackendTrip, "traveler_email"> {
  traveler?: string;
  traveler_email?: string;
}

export const Trips = () => {
  const [trips, setTrips] = useState<ExtendedBackendTrip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal States
  const [viewingTrip, setViewingTrip] = useState<ExtendedBackendTrip | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Cancellation Modal State
  const [cancellingTrip, setCancellingTrip] = useState<ExtendedBackendTrip | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // FIX: Force reset body pointer-events whenever modals change or unmount
  useEffect(() => {
    if (!viewingTrip && !cancellingTrip) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "auto";
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewingTrip, cancellingTrip]);

  // Fetch Trips
  const fetchTrips = useCallback(async (currentSearch: string, currentStatus: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const params: Record<string, string> = {};
      if (currentStatus && currentStatus !== "all") {
        params.status = currentStatus.toUpperCase();
      }
      if (currentSearch.trim()) {
        params.search = currentSearch.trim();
      }

      const response = await getAdminTripsApi(params);

      const tripData =
        response?.data ||
        response?.results ||
        (Array.isArray(response) ? response : []);

      setTrips(tripData as ExtendedBackendTrip[]);
    } catch (err: any) {
      console.error("Failed to fetch trips:", err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load trips."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTrips(search, statusFilter);
    }, 350);

    return () => clearTimeout(handler);
  }, [search, statusFilter, fetchTrips]);

  // View Details Handler
  const handleViewDetails = async (tripId: string) => {
    try {
      setIsLoadingDetail(true);
      const response = await getAdminTripDetailApi(tripId);
      const detailData = response?.data || response;
      setViewingTrip(detailData as ExtendedBackendTrip);
    } catch (err: any) {
      console.error("Failed to fetch trip details, falling back to local state:", err);
      const fallbackTrip = trips.find((t) => t.id === tripId) || null;
      setViewingTrip(fallbackTrip);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Confirm Cancellation
  const handleConfirmCancel = async () => {
    if (!cancellingTrip) return;

    if (!cancelReason.trim()) {
      setCancelError("Please provide a reason for cancellation.");
      return;
    }

    setIsSubmittingCancel(true);
    setCancelError(null);

    try {
      await cancelAdminTripApi(cancellingTrip.id, {
        reason: cancelReason.trim(),
      });

      setTrips((prevTrips) =>
        prevTrips.map((trip) =>
          trip.id === cancellingTrip.id
            ? { ...trip, status: "CANCELLED" }
            : trip
        )
      );

      setSuccessMessage(`Trip "${cancellingTrip.title || cancellingTrip.id}" was cancelled successfully.`);
      setCancellingTrip(null);
      setCancelReason("");
    } catch (err: any) {
      console.error("Failed to cancel trip:", err);
      setCancelError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to cancel trip. Please try again."
      );
    } finally {
      setIsSubmittingCancel(false);
      // Ensure page clicks are unlocked immediately after API finishes
      document.body.style.pointerEvents = "auto";
    }
  };

  const handleOpenCancelModal = (trip: ExtendedBackendTrip) => {
    setCancelError(null);
    setCancelReason("Violation of platform policy.");
    setCancellingTrip(trip);
  };

  const formatWeight = (val?: string | number) => {
    if (val === undefined || val === null) return "0.00";
    const parsed = typeof val === "number" ? val : parseFloat(val);
    return isNaN(parsed) ? "0.00" : parsed.toFixed(2);
  };

  const getStatusBadge = (status?: string) => {
    const formatted = (status || "").toUpperCase();
    if (formatted === "PLANNED") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          Planned
        </span>
      );
    }
    if (formatted === "ACTIVE") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          Active
        </span>
      );
    }
    if (formatted === "CANCELLED") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700 border border-rose-200">
          Cancelled
        </span>
      );
    }
    if (formatted === "COMPLETED") {
      return (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-700 border border-sky-200">
          Completed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
        {status || "UNKNOWN"}
      </span>
    );
  };

  const totalPages = Math.ceil(trips.length / rowsPerPage) || 1;
  const paginatedTrips = trips.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="flex flex-col gap-6 py-8 md:px-6 px-4">
      <HeadingSection
        heading="All Trips"
        subheading="Manage and monitor traveler trip listings across the platform"
      />

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSuccessMessage(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchTrips(search, statusFilter)}>
            Retry
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-1/3">
          <Input
            placeholder="Search email, route, or city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v: string) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PLANNED">Planned</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70">
              <TableHead className="font-semibold text-slate-700">Trip Title</TableHead>
              <TableHead className="font-semibold text-slate-700">Route</TableHead>
              <TableHead className="font-semibold text-slate-700">Departure</TableHead>
              <TableHead className="font-semibold text-slate-700">Available Capacity</TableHead>
              <TableHead className="font-semibold text-slate-700">Reward Rate</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-right text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex justify-center items-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                    <span>Loading trips...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-12">
                  No trips matched your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTrips.map((trip) => {
                const isCancelled = (trip.status || "").toUpperCase() === "CANCELLED";
                const isCompleted = (trip.status || "").toUpperCase() === "COMPLETED";
                const isCancellable = !isCancelled && !isCompleted;

                return (
                  <TableRow
                    key={trip.id}
                    className={cn(isCancelled ? "bg-slate-50/60 text-slate-400" : "")}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 text-sm">
                          {trip.title || "Untitled Trip"}
                        </span>

                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-medium text-slate-800">
                        {trip.from_city}, {trip.from_country}
                      </div>
                      <div className="text-xs text-slate-500">
                        → {trip.to_city}, {trip.to_country}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      <div>Dep: {trip.departure_date}</div>
                      {trip.arrival_date && <div>Arr: {trip.arrival_date}</div>}
                    </TableCell>

                    <TableCell className="text-sm font-medium text-slate-800">
                      {formatWeight(trip.available_weight_kg)} / {formatWeight(trip.max_weight_kg)} kg
                    </TableCell>

                    <TableCell className="text-sm font-medium text-slate-800">
                      {trip.reward_per_kg} {trip.currency}
                    </TableCell>

                    <TableCell>{getStatusBadge(trip.status)}</TableCell>

                    <TableCell className="text-right">
                      {/* FIX: modal={false} stops DropdownMenu from locking pointer events */}
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white min-w-[140px]">
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setTimeout(() => handleViewDetails(trip.id), 50);
                            }}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                            <span>View Details</span>
                          </DropdownMenuItem>

                          {isCancellable && (
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                setTimeout(() => handleOpenCancelModal(trip), 50);
                              }}
                              className="cursor-pointer text-rose-600 focus:text-rose-600 flex items-center gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Cancel Trip</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-slate-500">
            Showing {((page - 1) * rowsPerPage) + 1} to{" "}
            {Math.min(page * rowsPerPage, trips.length)} of {trips.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-xs text-slate-600 font-medium px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* VIEW DETAILS DIALOG */}
      <Dialog
        open={!!viewingTrip || isLoadingDetail}
        onOpenChange={(open) => {
          if (!open) {
            setViewingTrip(null);
            document.body.style.pointerEvents = "auto";
          }
        }}
      >
        <DialogContent className="max-w-xl bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <Plane className="h-5 w-5 text-blue-600" />
              Trip Details
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="text-sm">Fetching detailed trip record...</span>
            </div>
          ) : viewingTrip ? (
            <div className="space-y-5 py-2">
              <div className="flex justify-between items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{viewingTrip.title || "Untitled Trip"}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Traveler: {viewingTrip.traveler_email || viewingTrip.traveler || "N/A"}
                  </p>
                </div>
                <div>{getStatusBadge(viewingTrip.status)}</div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </p>
                <p className="text-sm text-slate-700 bg-slate-50/80 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {viewingTrip.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> From
                  </span>
                  <p className="font-semibold text-slate-900 text-sm mt-0.5">
                    {viewingTrip.from_city}, {viewingTrip.from_country}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> To
                  </span>
                  <p className="font-semibold text-slate-900 text-sm mt-0.5">
                    {viewingTrip.to_city}, {viewingTrip.to_country}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t pt-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Departure
                  </span>
                  <span className="font-semibold text-slate-800">{viewingTrip.departure_date}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Arrival
                  </span>
                  <span className="font-semibold text-slate-800">{viewingTrip.arrival_date || "N/A"}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Weight className="w-3.5 h-3.5 text-slate-400" /> Capacity
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatWeight(viewingTrip.available_weight_kg)} / {formatWeight(viewingTrip.max_weight_kg)} kg
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Reward / kg
                  </span>
                  <span className="font-semibold text-slate-800">
                    {viewingTrip.reward_per_kg} {viewingTrip.currency}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Public Access</span>
                  <span className="font-semibold text-slate-800">
                    {viewingTrip.is_public ? "Public" : "Private"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Active State</span>
                  <span className="font-semibold text-slate-800">
                    {viewingTrip.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="pt-3 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setViewingTrip(null);
                document.body.style.pointerEvents = "auto";
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CANCEL CONFIRMATION DIALOG */}
      <Dialog
        open={!!cancellingTrip}
        onOpenChange={(open) => {
          if (!open) {
            setCancellingTrip(null);
            document.body.style.pointerEvents = "auto";
          }
        }}
      >
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-rose-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Cancel Trip
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-slate-600 mt-2">
            Are you sure you want to cancel{" "}
            <strong>"{cancellingTrip?.title || "this trip"}"</strong>? This action cannot be undone.
          </p>

          <div className="flex flex-col gap-1.5 mt-4">
            <label className="text-xs font-semibold text-slate-700">
              Cancellation Reason <span className="text-rose-500">*</span>
            </label>
            <Textarea
              rows={3}
              placeholder="e.g. Violation of platform policy."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="text-sm"
            />
          </div>

          {cancelError && (
            <p className="text-xs text-rose-600 font-medium mt-1">{cancelError}</p>
          )}

          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setCancellingTrip(null);
                document.body.style.pointerEvents = "auto";
              }}
              disabled={isSubmittingCancel}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={isSubmittingCancel}
            >
              {isSubmittingCancel ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
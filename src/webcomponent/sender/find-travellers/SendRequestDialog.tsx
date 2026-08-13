"use client";

import { useState, useEffect } from "react";
import { BackendTrip } from "@/api/trip.api";
import { APIPackageItem } from "@/api/sender.package.api";
import {
  requestPublicTripBooking,
  getMyPackagesApi,
  SenderPackage,
} from "@/api/booking.api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Package,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Weight,
  ArrowRight,
  FileEdit,
  Clock,
  MapPin,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { PackageFormModal, TripContextData } from "../package/PackageFormModal";

interface SendRequestDialogProps {
  setOpen: (open: boolean) => void;
  trip: BackendTrip | null;
  onSuccess?: () => void;
}

type DialogStep =
  | "LOADING"
  | "NO_PACKAGE"
  | "PACKAGE_UNDER_REVIEW"
  | "PACKAGE_DRAFT"
  | "SELECT_PACKAGE"
  | "SUCCESS";

// ============================================================================
// HELPER VALIDATORS & MATCHING LOGIC
// ============================================================================

const normalize = (value?: string): string => value?.trim().toLowerCase() || "";

export const isPackageCompatibleWithTrip = (
  pkg: SenderPackage | Record<string, any>,
  trip: BackendTrip | Record<string, any>
): boolean => {
  if (pkg.status !== "PUBLISHED") {
    return false;
  }

  // ROUTE MATCH
  const pkgPickupCountry = pkg.pickup_country || pkg.from_country;
  const pkgPickupCity = pkg.pickup_city || pkg.from_city;
  const pkgDestCountry = pkg.destination_country || pkg.to_country;
  const pkgDestCity = pkg.destination_city || pkg.to_city;

  const routeMatches =
    normalize(pkgPickupCountry) === normalize(trip.from_country) &&
    normalize(pkgPickupCity) === normalize(trip.from_city) &&
    normalize(pkgDestCountry) === normalize(trip.to_country) &&
    normalize(pkgDestCity) === normalize(trip.to_city);

  if (!routeMatches) {
    return false;
  }

  // DATE MATCH (Safely parsed via getTime())
  const pkgPickupDate = pkg.pickup_date || pkg.departure_date;
  const tripDepartureDate = trip.departure_date;

  if (pkgPickupDate && tripDepartureDate) {
    if (new Date(pkgPickupDate).getTime() > new Date(tripDepartureDate).getTime()) {
      return false;
    }
  }

  const pkgLatestDelivery = pkg.latest_delivery_date;
  const tripArrivalDate = trip.arrival_date;

  if (pkgLatestDelivery && tripArrivalDate) {
    if (new Date(tripArrivalDate).getTime() > new Date(pkgLatestDelivery).getTime()) {
      return false;
    }
  }

  return true;
};

const extractApiErrorMessage = (error: any): string => {
  if (!error?.response?.data) {
    return error?.message || "Failed to submit booking request. Please try again.";
  }

  const data = error.response.data;

  if (typeof data === "string") return data;
  if (data.message && typeof data.message === "string") return data.message;
  if (data.detail && typeof data.detail === "string") return data.detail;

  if (data.non_field_errors) {
    return Array.isArray(data.non_field_errors)
      ? data.non_field_errors[0]
      : String(data.non_field_errors);
  }

  if (typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const fieldValue = data[firstKey];
      return Array.isArray(fieldValue) ? fieldValue[0] : String(fieldValue);
    }
  }

  return "An unexpected error occurred while processing your request.";
};

export const SendRequestDialog = ({
  setOpen,
  trip,
  onSuccess,
}: SendRequestDialogProps) => {
  const [step, setStep] = useState<DialogStep>("LOADING");
  const [compatiblePackages, setCompatiblePackages] = useState<SenderPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [packageToEdit, setPackageToEdit] = useState<SenderPackage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (trip) {
      fetchAndFilterPackages();
    }
  }, [trip]);

  const fetchAndFilterPackages = async (autoSelectId?: string) => {
    try {
      setStep("LOADING");
      setErrorMessage(null);

      const response = await getMyPackagesApi();
      const allPackages: SenderPackage[] = Array.isArray(response)
        ? response
        : (response as any)?.data || [];

      if (!allPackages || allPackages.length === 0) {
        setStep("NO_PACKAGE");
        return;
      }

      const matchingPackages = allPackages.filter((pkg) =>
        isPackageCompatibleWithTrip(pkg, trip!)
      );

      if (matchingPackages.length === 0) {
        const draftPackages = allPackages.filter((pkg) => pkg.status === "DRAFT");
        if (draftPackages.length > 0) {
          setStep("PACKAGE_DRAFT");
          setPackageToEdit(draftPackages[0]);
          return;
        }

        const reviewPackages = allPackages.filter(
          (pkg) => pkg.status === "PENDING_REVIEW"
        );
        if (reviewPackages.length > 0) {
          setStep("PACKAGE_UNDER_REVIEW");
          return;
        }

        setStep("NO_PACKAGE");
        return;
      }

      setCompatiblePackages(matchingPackages);

      // Auto-select the newly created package if provided, otherwise default to first
      const targetSelection =
        autoSelectId && matchingPackages.some((p) => p.id === autoSelectId)
          ? autoSelectId
          : matchingPackages[0].id;

      setSelectedPackageId(targetSelection);
      setStep("SELECT_PACKAGE");
    } catch (err: any) {
      console.error("Failed to load packages:", err);
      setErrorMessage("Failed to load your packages. Please try again.");
      setStep("NO_PACKAGE");
    }
  };

  if (!trip) return null;

  const tripAvailableCapacity = parseFloat(
    String(trip.available_weight_kg ?? (trip as any).available_capacity_kg ?? "0")
  );

  // Format Trip context payload for PackageFormModal in trip mode
  const tripContextData: TripContextData = {
    id: trip.id,
    pickup_city: trip.from_city,
    pickup_country: trip.from_country,
    destination_city: trip.to_city,
    destination_country: trip.to_country,
    pickup_date: trip.departure_date,
    latest_delivery_date: trip.arrival_date || trip.departure_date,
    suggested_reward:
      parseFloat(
        String((trip as any).suggested_reward ?? (trip as any).reward_per_kg ?? 0)
      ) || undefined,
    available_weight_kg: tripAvailableCapacity,
    currency: (trip as any).currency || "USD",
  };

  const handleOpenCreateModal = () => {
    // Clear packageToEdit so PackageFormModal enters trip-creation mode
    setPackageToEdit(null);
    setShowCreatePackageModal(true);
  };

  const handleOpenDraftEdit = (draftPkg: SenderPackage) => {
    setPackageToEdit(draftPkg);
    setShowCreatePackageModal(true);
  };

  const selectedPkg = compatiblePackages.find((p) => p.id === selectedPackageId);

  const selectedPkgWeight = selectedPkg
    ? parseFloat(String(selectedPkg.weight_kg ?? (selectedPkg as any).weight ?? "0"))
    : 0;

  const isWeightExceeded = selectedPkg
    ? selectedPkgWeight > tripAvailableCapacity
    : false;

  const handleSubmitBooking = async () => {
    if (!selectedPackageId || isWeightExceeded) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await requestPublicTripBooking({
        trip_id: trip.id,
        package_id: selectedPackageId,
      });

      setStep("SUCCESS");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Booking request failed:", err);
      setErrorMessage(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePackageCreated = async (createdPkg?: APIPackageItem) => {
    setShowCreatePackageModal(false);
    setPackageToEdit(null);
    await fetchAndFilterPackages(createdPkg?.id);
  };

  return (
    <>
      {/* 1. Primary Booking Request Dialog */}
      <Dialog
        open={Boolean(trip) && !showCreatePackageModal}
        onOpenChange={(open) => {
          if (!open) setOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-lg p-6 overflow-hidden flex flex-col justify-between max-h-[90vh]">
          <DialogHeader className="border-b pb-4 shrink-0 text-left">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1 pr-6">
              <span>Trip Request</span>
              <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Available: {tripAvailableCapacity} kg
              </span>
            </div>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
              <span>{trip.from_city}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{trip.to_city}</span>
            </DialogTitle>
            {trip.departure_date && (
              <DialogDescription className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  Departs: {new Date(trip.departure_date).toLocaleDateString()}
                </span>
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Dynamic Error Message */}
          {errorMessage && (
            <div className="my-3 p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-start gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* STEP 1: LOADING */}
          {step === "LOADING" && (
            <div className="py-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-sm font-medium text-gray-600">
                Checking compatible packages...
              </p>
            </div>
          )}

          {/* STEP 2: NO COMPATIBLE PACKAGES FOUND */}
          {step === "NO_PACKAGE" && (
            <div className="py-4 flex flex-col items-center text-center">
              <div className="bg-amber-50 p-3 rounded-full mb-3">
                <Package className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Package Required</h3>
              <p className="text-sm text-gray-600 mt-1 max-w-xs leading-relaxed">
                You need to create and publish a package matching this route (
                <span className="font-semibold text-gray-800">
                  {trip.from_city} → {trip.to_city}
                </span>
                ) before requesting space.
              </p>
              <div className="flex gap-3 mt-6 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer"
                  onClick={handleOpenCreateModal}
                >
                  <Plus className="w-4 h-4 mr-1" /> Create Package
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: PACKAGE UNDER REVIEW */}
          {step === "PACKAGE_UNDER_REVIEW" && (
            <div className="py-4 flex flex-col items-center text-center">
              <div className="bg-amber-50 p-3 rounded-full mb-3">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Package Not Ready</h3>
              <p className="text-sm text-gray-600 mt-2 max-w-xs leading-relaxed">
                Your package is currently under review. You can request space on
                this trip after your package has been published.
              </p>
              <div className="flex gap-3 mt-6 w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium cursor-pointer"
                  onClick={handleOpenCreateModal}
                >
                  <Plus className="w-4 h-4 mr-1" /> Create New Package
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: PACKAGE IS A DRAFT */}
          {step === "PACKAGE_DRAFT" && (
            <div className="py-4 flex flex-col items-center text-center">
              <div className="bg-blue-50 p-3 rounded-full mb-3">
                <FileEdit className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Unfinished Draft Found
              </h3>
              <p className="text-sm text-gray-600 mt-2 max-w-xs leading-relaxed">
                You have an unfinished draft. Complete it or create a new package for this trip.
              </p>
              <div className="flex flex-col gap-2 mt-6 w-full">
                {packageToEdit && (
                  <Button
                    type="button"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium cursor-pointer"
                    onClick={() => handleOpenDraftEdit(packageToEdit)}
                  >
                    Complete Existing Draft
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleOpenCreateModal}
                >
                  <Plus className="w-4 h-4 mr-1" /> Create New Package
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: SELECT COMPATIBLE PACKAGE */}
          {step === "SELECT_PACKAGE" && (
            <div className="flex flex-col gap-4 overflow-hidden pt-2">
              <div className="shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-0.5">
                    Select a Package
                  </h3>
                  <p className="text-xs text-gray-500">
                    Only published packages matching route ({trip.from_city} →{" "}
                    {trip.to_city}) are displayed.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-semibold"
                  onClick={handleOpenCreateModal}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> New
                </Button>
              </div>

              {/* Scrollable Package List Container */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {compatiblePackages.map((pkg) => {
                  const isSelected = pkg.id === selectedPackageId;
                  const pkgWeight = parseFloat(
                    String(pkg.weight_kg ?? (pkg as any).weight ?? "0")
                  );
                  const exceedsTripWeight = pkgWeight > tripAvailableCapacity;
                  const pkgFrom = pkg.pickup_city || pkg.from_city;
                  const pkgTo = pkg.destination_city || pkg.to_city;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-3 border rounded-xl cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {pkg.image_url ? (
                          <Image
                            src={pkg.image_url}
                            alt={pkg.title}
                            width={44}
                            height={44}
                            className="rounded-lg object-cover w-11 h-11 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-800 truncate">
                            {pkg.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1 font-medium shrink-0">
                              <Weight className="w-3 h-3 text-gray-400" />{" "}
                              {pkgWeight} kg
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium truncate">
                              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />{" "}
                              {pkgFrom} → {pkgTo}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                        <input
                          type="radio"
                          name="package_select"
                          checked={isSelected}
                          onChange={() => setSelectedPackageId(pkg.id)}
                          className="accent-amber-500 cursor-pointer"
                        />
                        {exceedsTripWeight && (
                          <span className="text-[10px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            Too Heavy
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {isWeightExceeded && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg font-medium flex items-center gap-1.5 shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>
                    Weight exceeded: Package ({selectedPkgWeight} kg) exceeds
                    traveler's available capacity ({tripAvailableCapacity} kg).
                  </span>
                </p>
              )}

              <div className="flex items-center justify-between pt-2 shrink-0 border-t border-gray-100">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs text-gray-500 hover:text-gray-900 cursor-pointer"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={!selectedPackageId || isWeightExceeded || isSubmitting}
                  onClick={handleSubmitBooking}
                  className="px-6 bg-amber-500 hover:bg-amber-600 text-white font-medium cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Request Booking"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: SUCCESS CONFIRMATION */}
          {step === "SUCCESS" && (
            <div className="py-4 flex flex-col items-center text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
              <h3 className="text-lg font-bold text-gray-900">Request Sent!</h3>
              <p className="text-sm text-gray-600 mt-1 max-w-xs leading-relaxed">
                Your booking request has been sent to the traveler. You will be
                notified when they respond.
              </p>
              <Button
                type="button"
                className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-white font-medium cursor-pointer"
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Package Form Modal Integration */}
      {showCreatePackageModal && (
        <PackageFormModal
          isOpen={showCreatePackageModal}
          mode={packageToEdit ? "direct" : "trip"}
          tripData={tripContextData}
          packageToEdit={packageToEdit as unknown as APIPackageItem}
          onClose={() => {
            setShowCreatePackageModal(false);
            setPackageToEdit(null);
          }}
          onSuccess={handlePackageCreated}
        />
      )}
    </>
  );
};
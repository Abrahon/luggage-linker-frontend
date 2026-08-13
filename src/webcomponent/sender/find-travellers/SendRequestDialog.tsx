"use client";

import { useState, useEffect } from "react";
import { BackendTrip } from "@/api/trip.api";
import {
  requestPublicTripBooking,
  getMyPackagesApi,
  SenderPackage,
} from "@/api/booking.api";
import { Button } from "@/components/ui/button";
import {
  Package,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Weight,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
// Adjust import path according to your project structure
import { PackageFormModal } from "../package/PackageFormModal";

interface SendRequestDialogProps {
  setOpen: (open: boolean) => void;
  trip: BackendTrip | null;
  onSuccess?: () => void;
}

type DialogStep =
  | "LOADING"
  | "NO_PACKAGE"
  | "PACKAGE_UNDER_REVIEW"
  | "SELECT_PACKAGE"
  | "SUCCESS";

export const SendRequestDialog = ({
  setOpen,
  trip,
  onSuccess,
}: SendRequestDialogProps) => {
  const [step, setStep] = useState<DialogStep>("LOADING");
  const [packages, setPackages] = useState<SenderPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (trip) {
      fetchPackages();
    }
  }, [trip]);

  const fetchPackages = async () => {
    try {
      setStep("LOADING");
      setErrorMessage(null);
      const userPackages = await getMyPackagesApi();
      setPackages(userPackages);

      if (userPackages.length === 0) {
        setStep("NO_PACKAGE");
        return;
      }

      const publishedPackages = userPackages.filter(
        (pkg) => pkg.status === "PUBLISHED"
      );

      if (publishedPackages.length > 0) {
        setStep("SELECT_PACKAGE");
        // Pre-select first published package
        setSelectedPackageId(publishedPackages[0].id);
      } else {
        setStep("PACKAGE_UNDER_REVIEW");
      }
    } catch (err: any) {
      console.error("Failed to load packages:", err);
      setErrorMessage("Failed to load your packages. Please try again.");
      setStep("NO_PACKAGE");
    }
  };

  if (!trip) return null;

  const publishedPackages = packages.filter((p) => p.status === "PUBLISHED");
  const selectedPkg = publishedPackages.find((p) => p.id === selectedPackageId);
  
  const isWeightExceeded =
    selectedPkg &&
    Number(selectedPkg.weight_kg) > Number(trip.available_weight_kg);

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
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to submit booking request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePackageCreated = () => {
    setShowCreatePackageModal(false);
    // Refresh packages list after creation
    fetchPackages();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative transition-all">
        {/* Header Trip Summary */}
        <div className="border-b pb-4 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
            <span>Trip Request</span>
            <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Available: {trip.available_weight_kg} kg
            </span>
          </div>
          <div className="flex items-center gap-2 text-base font-bold text-gray-900">
            <span>{trip.from_city}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span>{trip.to_city}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: LOADING */}
        {step === "LOADING" && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            <p className="text-sm font-medium text-gray-600">
              Checking your packages...
            </p>
          </div>
        )}

        {/* STEP 2: NO PACKAGES FOUND */}
        {step === "NO_PACKAGE" && (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="bg-yellow-50 p-3 rounded-full mb-3">
              <Package className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Package Required</h3>
            <p className="text-sm text-gray-600 mt-1 max-w-xs">
              You need to create and publish a package before requesting to book
              space on this trip.
            </p>
            <div className="flex gap-3 mt-6 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                onClick={() => setShowCreatePackageModal(true)}
              >
                <Plus className="w-4 h-4 mr-1" /> Create Package
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PACKAGE UNDER REVIEW */}
        {step === "PACKAGE_UNDER_REVIEW" && (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="bg-blue-50 p-3 rounded-full mb-3">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Package Not Ready
            </h3>
            <p className="text-sm text-gray-600 mt-1 max-w-xs">
              Your package is currently under admin review or saved as draft.
              You can request trips once it is approved and published.
            </p>
            <div className="flex gap-3 mt-6 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => setShowCreatePackageModal(true)}
              >
                Create New Package
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: SELECT PUBLISHED PACKAGE */}
        {step === "SELECT_PACKAGE" && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Select a Package
              </h3>
              <p className="text-xs text-gray-500">
                Choose the published package you want the traveler to carry.
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {publishedPackages.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                const exceedsTripWeight =
                  Number(pkg.weight_kg) > Number(trip.available_weight_kg);

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`p-3 border rounded-xl cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? "border-yellow-500 bg-yellow-50/50 ring-1 ring-yellow-500"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {pkg.image_url ? (
                        <Image
                          src={pkg.image_url}
                          alt={pkg.title}
                          width={44}
                          height={44}
                          className="rounded-lg object-cover w-11 h-11"
                        />
                      ) : (
                        <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">
                          {pkg.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Weight className="w-3 h-3" /> {pkg.weight_kg} kg
                          </span>
                          <span>•</span>
                          <span>
                            {pkg.from_city} → {pkg.to_city}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <input
                        type="radio"
                        name="package_select"
                        checked={isSelected}
                        onChange={() => setSelectedPackageId(pkg.id)}
                        className="accent-yellow-500"
                      />
                      {exceedsTripWeight && (
                        <span className="text-[10px] text-red-500 font-medium">
                          Too Heavy
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {isWeightExceeded && (
              <p className="text-xs text-red-600 font-medium">
                ⚠️ The selected package ({selectedPkg?.weight_kg} kg) exceeds
                the available capacity ({trip.available_weight_kg} kg) for this trip.
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                className="text-xs text-gray-500 hover:text-gray-900"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={!selectedPackageId || isWeightExceeded || isSubmitting}
                onClick={handleSubmitBooking}
                className="px-6 bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
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

        {/* STEP 5: SUCCESS CONFIRMATION */}
        {step === "SUCCESS" && (
          <div className="py-6 flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
            <h3 className="text-lg font-bold text-gray-900">Request Sent!</h3>
            <p className="text-sm text-gray-600 mt-1 max-w-xs">
              Your request has been delivered to the traveler. You will be
              notified when they respond.
            </p>
            <Button
              className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        )}
      </div>

      {/* Embedded Package Form Modal when creation is required */}
      {showCreatePackageModal && (
        <PackageFormModal
          isOpen={showCreatePackageModal}
          onClose={() => setShowCreatePackageModal(false)}
          onSuccess={handlePackageCreated}
        />
      )}
    </div>
  );
};
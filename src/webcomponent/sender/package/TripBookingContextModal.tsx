"use client";

import React, { useState, useEffect } from "react";
import {
  Package as PackageIcon,
  Plane,
  Lock,
  Plus,
  CheckCircle2,
  Loader2,
  Calendar,
  MapPin,
  ShieldCheck,
  X,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

// ==========================================
// TYPES
// ==========================================

export interface TripData {
  id: string;
  traveler: string;
  title: string;
  description: string;
  from_country: string;
  from_city: string;
  to_country: string;
  to_city: string;
  departure_date: string;
  arrival_date: string;
  max_weight_kg: string;
  available_weight_kg: string;
  reward_per_kg: string;
  currency: string;
  status: string;
}

export interface UserPackage {
  id: string;
  title: string;
  category: string;
  weight_kg: number;
  from_country: string;
  from_city: string;
  to_country: string;
  to_city: string;
  status: string;
}

interface TripBookingContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripData | null;
  /** Existing user packages to check for matching route/weight */
  userPackages: UserPackage[];
  /** Triggered when selecting an EXISTING matching package */
  onSelectExistingPackage: (
    packageId: string,
    requestedWeight: number,
    calculatedReward: number
  ) => Promise<void>;
  /** Triggered when creating a NEW package with locked route/dates */
  onCreateAndBookPackage: (newPackagePayload: any) => Promise<void>;
}

// ==========================================
// COMPONENT
// ==========================================

export function TripBookingContextModal({
  isOpen,
  onClose,
  trip,
  userPackages = [],
  onSelectExistingPackage,
  onCreateAndBookPackage,
}: TripBookingContextModalProps) {
  if (!isOpen || !trip) return null;

  const availableWeight = parseFloat(trip.available_weight_kg || "0");
  const rewardRate = parseFloat(trip.reward_per_kg || "0");

  // 1. Filter existing matching packages
  const matchingPackages = userPackages.filter((pkg) => {
    const isRouteMatch =
      pkg.from_country.toLowerCase() === trip.from_country.toLowerCase() &&
      pkg.from_city.toLowerCase() === trip.from_city.toLowerCase() &&
      pkg.to_country.toLowerCase() === trip.to_country.toLowerCase() &&
      pkg.to_city.toLowerCase() === trip.to_city.toLowerCase();

    const isWeightValid = pkg.weight_kg <= availableWeight;
    const isUnassigned = pkg.status === "UNASSIGNED" || !pkg.status;

    return isRouteMatch && isWeightValid && isUnassigned;
  });

  // Modal Flow State
  const [mode, setMode] = useState<"SELECT" | "CREATE">(
    matchingPackages.length > 0 ? "SELECT" : "CREATE"
  );
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    matchingPackages[0]?.id || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Inherited Package Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "DOCUMENT",
    weight_kg: "",
    description: "",
    declared_as_legal: false,
    terms_accepted: false,
  });

  // Reset or adjust state when modal opens
  useEffect(() => {
    if (matchingPackages.length > 0) {
      setMode("SELECT");
      setSelectedPackageId(matchingPackages[0].id);
    } else {
      setMode("CREATE");
    }
  }, [trip]);

  // Selected package reference
  const currentSelectedPkg = userPackages.find((p) => p.id === selectedPackageId);

  // ------------------------------------------
  // HANDLERS
  // ------------------------------------------

  // Submit flow for Existing Package
  const handleExistingSubmit = async () => {
    if (!currentSelectedPkg) {
      toast.error("Please select a package.");
      return;
    }
    try {
      setIsSubmitting(true);
      const totalReward = currentSelectedPkg.weight_kg * rewardRate;
      await onSelectExistingPackage(
        currentSelectedPkg.id,
        currentSelectedPkg.weight_kg,
        totalReward
      );
      toast.success("Booking request sent successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to send booking request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit flow for New Inherited Package
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pkgWeight = parseFloat(formData.weight_kg);

    if (!formData.title.trim() || formData.title.length < 3) {
      toast.error("Package title is required (min 3 characters).");
      return;
    }
    if (!pkgWeight || pkgWeight <= 0) {
      toast.error("Enter a valid weight.");
      return;
    }
    if (pkgWeight > availableWeight) {
      toast.error(`Weight cannot exceed ${availableWeight} kg.`);
      return;
    }
    if (!formData.declared_as_legal || !formData.terms_accepted) {
      toast.error("Please accept the legal declaration and terms.");
      return;
    }

    try {
      setIsSubmitting(true);

      // PAYLOAD WITH INHERITED LOCKED TRIP DATA
      const payload = {
        trip_id: trip.id,
        title: formData.title,
        category: formData.category,
        weight_kg: pkgWeight,
        description: formData.description,
        // LOCKED TRIP DATA
        from_country: trip.from_country,
        from_city: trip.from_city,
        to_country: trip.to_country,
        to_city: trip.to_city,
        pickup_date: trip.departure_date,
        delivery_date: trip.arrival_date,
        reward_amount: pkgWeight * rewardRate,
        currency: trip.currency,
        declared_as_legal: formData.declared_as_legal,
        terms_accepted: formData.terms_accepted,
      };

      await onCreateAndBookPackage(payload);
      toast.success("Package created & booking request sent!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to process request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Plane className="w-4 h-4" /> Trip Booking Request
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Book Space on {trip.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Available: <span className="font-semibold text-slate-700 dark:text-slate-300">{trip.available_weight_kg} kg</span> • Rate: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${trip.reward_per_kg} {trip.currency}/kg</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option Toggle Bar (If user has matching packages) */}
        {matchingPackages.length > 0 && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 p-1">
            <button
              type="button"
              onClick={() => setMode("SELECT")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === "SELECT"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Select Existing Package ({matchingPackages.length})
            </button>
            <button
              type="button"
              onClick={() => setMode("CREATE")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === "CREATE"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              + Create Package for this Trip
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* VIEW A: SELECT EXISTING PACKAGE */}
          {mode === "SELECT" && matchingPackages.length > 0 && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>We found existing package(s) matching this trip route!</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {matchingPackages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  const estimatedReward = pkg.weight_kg * rewardRate;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 ring-2 ring-blue-500/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <PackageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {pkg.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Category: {pkg.category} • {pkg.weight_kg} kg
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          ${estimatedReward.toFixed(2)} {trip.currency}
                        </p>
                        <p className="text-[10px] text-slate-400">Reward</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setMode("CREATE")}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Need to ship a different package? Create new package
              </button>
            </div>
          )}

          {/* VIEW B: CREATE NEW INHERITED PACKAGE */}
          {mode === "CREATE" && (
            <form id="trip-booking-form" onSubmit={handleCreateSubmit} className="space-y-4">
              
              {/* LOCKED ROUTE & DATES LABELS */}
              <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                    <Lock className="w-3 h-3 text-amber-500" /> Locked Trip Context
                  </span>
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px]">
                    Non-Editable
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Origin & Destination Label */}
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">ROUTE</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 text-xs truncate">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      {trip.from_city}, {trip.from_country} → {trip.to_city}, {trip.to_country}
                    </span>
                  </div>

                  {/* Travel Dates Label */}
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">DATES</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5 text-xs truncate">
                      <Calendar className="w-3 h-3 text-emerald-500 shrink-0" />
                      {trip.departure_date} to {trip.arrival_date}
                    </span>
                  </div>
                </div>
              </div>

              {/* EDITABLE PACKAGE INPUTS */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Package Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Leather Jacket & Gift Box"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="DOCUMENT">Document / Papers</option>
                      <option value="ELECTRONICS">Electronics</option>
                      <option value="CLOTHING">Clothing & Apparel</option>
                      <option value="FOOD">Food / Snacks</option>
                      <option value="OTHER">Other Items</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Weight (kg) * <span className="text-slate-400">(Max: {availableWeight}kg)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      max={availableWeight}
                      required
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                      placeholder={`Max ${availableWeight}`}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Auto Calculated Reward */}
                {parseFloat(formData.weight_kg) > 0 && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                      Calculated Reward ({formData.weight_kg} kg × ${rewardRate}):
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      ${(parseFloat(formData.weight_kg) * rewardRate).toFixed(2)} {trip.currency}
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide details about size or special handing instructions..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Terms Checkboxes */}
                <div className="space-y-1.5 pt-1">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.declared_as_legal}
                      onChange={(e) => setFormData({ ...formData, declared_as_legal: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      I declare that this package contains no illegal or prohibited items.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.terms_accepted}
                      onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      I accept the delivery terms and rules.
                    </span>
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          {mode === "SELECT" ? (
            <button
              type="button"
              onClick={handleExistingSubmit}
              disabled={isSubmitting || !selectedPackageId}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send Booking Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          ) : (
            <button
              type="submit"
              form="trip-booking-form"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Create Package & Request</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
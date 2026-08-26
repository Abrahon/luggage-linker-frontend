"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Package as PackageIcon,
  MapPin,
  Calendar,
  Weight,
  Tag,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { APIPackageItem, getPackageById } from "@/api/sender.package.api";
import { toast } from "sonner";

interface PackageDetailModalProps {
  isOpen: boolean;
  packageItem: APIPackageItem;
  onClose: () => void;
  onRefresh?: () => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  isOpen,
  packageItem,
  onClose,
}) => {
  const [details, setDetails] = useState<APIPackageItem>(packageItem);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch complete details on modal mount or ID change
  useEffect(() => {

    let isMounted = true;

    const fetchDetails = async () => {
      if (!packageItem?.id) return;
      try {
        setLoading(true);
        const data = await getPackageById(packageItem.id);
        if (isMounted) {
          setDetails(data);
          // Set primary image or first available as main preview
          const mainImg =
            data.images?.find((img) => img.is_primary)?.image ||
            data.images?.[0]?.image ||
            null;
          setSelectedImage(mainImg);
        }
      } catch (err: any) {
        toast.error("Failed to load full package details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (isOpen) {
      fetchDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, packageItem?.id]);

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
      PUBLISHED: "bg-blue-50 text-blue-700 border-blue-200",
      MATCHED: "bg-purple-50 text-purple-700 border-purple-200",
      BOOKED: "bg-orange-50 text-orange-700 border-orange-200",
      DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${
          statusStyles[status] || "bg-slate-50 text-slate-700 border-slate-200"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 my-8 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
              <PackageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Package Details
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                ID: {details.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-xs text-slate-400 font-semibold">
              Fetching package specifications...
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
            {/* Title & Status Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Title
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {details.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(details.status || "DRAFT")}
              </div>
            </div>

            {/* Gallery Section */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Images ({details.images?.length || 0})
              </span>
              {details.images && details.images.length > 0 ? (
                <div className="space-y-3">
                  <div className="w-full h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
                    <img
                      src={selectedImage || details.images[0].image}
                      alt="Selected Package"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* Thumbnails */}
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {details.images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(img.image)}
                        className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                          selectedImage === img.image
                            ? "border-amber-500 scale-95 shadow-sm"
                            : "border-slate-200 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img.image}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                  <PackageIcon className="w-8 h-8 mb-1" />
                  <p className="text-xs font-medium">No images uploaded for this package</p>
                </div>
              )}
            </div>

            {/* Route Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" /> Pickup Location
                </div>
                <p className="text-sm font-extrabold text-slate-800">
                  {details.pickup_city}, {details.pickup_country}
                </p>
                <p className="text-xs text-slate-500">{details.pickup_address}</p>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Destination
                </div>
                <p className="text-sm font-extrabold text-slate-800">
                  {details.destination_city}, {details.destination_country}
                </p>
                <p className="text-xs text-slate-500">{details.destination_address}</p>
              </div>
            </div>

            {/* Main Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase">
                  <Weight className="w-3.5 h-3.5" /> Weight
                </div>
                <p className="text-sm font-black text-slate-800 mt-1">
                  {details.weight} kg
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase">
                  <Tag className="w-3.5 h-3.5" /> Category
                </div>
                <p className="text-sm font-black text-slate-800 mt-1 capitalize">
                  {details.category}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Description
              </span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {details.description || "No description provided."}
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Date</p>
                  <p className="text-xs font-bold text-slate-800">{details.pickup_date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Latest Delivery</p>
                  <p className="text-xs font-bold text-slate-800">{details.latest_delivery_date}</p>
                </div>
              </div>
            </div>

            {/* Legal Status */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  details.declared_as_legal
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {details.declared_as_legal ? "Declared Legal" : "Unverified Legal State"}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
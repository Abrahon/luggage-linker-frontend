// src/components/sender/card/PackageCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import { APIPackageItem } from "@/api/sender.package.api";
import {
  Package,
  MapPin,
  ArrowRight,
  Weight,
  DollarSign,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface PackageCardProps {
  packageItem: APIPackageItem;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Status badge styling helper
const getStatusBadge = (status?: string) => {
  switch (status?.toUpperCase()) {
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "MATCHED":
    case "BOOKED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "IN_TRANSIT":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "DELIVERED":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "DRAFT":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "CANCELLED":
    case "EXPIRED":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

export const PackageCard: React.FC<PackageCardProps> = ({
  packageItem,
  onView,
  onEdit,
  onDelete,
}) => {
  // Property extraction using actual APIPackageItem field names
  const title = packageItem.title || "Untitled Package";
  const category = packageItem.category || "General Item";
  
  const pickupCity =
    packageItem.pickup_city || (packageItem as any).pickup || (packageItem as any).from_city || "N/A";
  const destinationCity =
    packageItem.destination_city || (packageItem as any).destination || (packageItem as any).to_city || "N/A";
    
  // Using packageItem.weight directly as defined in sender.package.api.ts
  const weight = packageItem.weight ?? (packageItem as any).weight_kg ?? 0;
  const reward = packageItem.reward_amount ?? (packageItem as any).reward ?? 0;
    
  const status = packageItem.status || "DRAFT";
  const imageUrl =
    (packageItem as any).image_url ||
    (packageItem as any).image ||
    ((packageItem as any).images && (packageItem as any).images[0]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Top Image / Placeholder Header */}
        <div className="relative w-full h-36 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
              <Package className="w-8 h-8 stroke-[1.5]" />
              <span className="text-[11px] font-medium">No Image Uploaded</span>
            </div>
          )}

          {/* Status Badge */}
          <span
            className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs ${getStatusBadge(
              status
            )}`}
          >
            {status.replace("_", " ")}
          </span>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Category & Title */}
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              {category}
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
              {title}
            </h3>
          </div>

          {/* Route Info */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold line-clamp-1">{pickupCity}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold line-clamp-1">{destinationCity}</span>
          </div>

          {/* Weight & Reward Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
              <Weight className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-none">
                  Weight
                </span>
                <span className="font-bold text-slate-800">{weight} kg</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-none">
                  Reward
                </span>
                <span className="font-bold text-emerald-700">${reward}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-1.5">
        {onView && (
          <button
            onClick={onView}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition cursor-pointer"
            title="Edit Package"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition cursor-pointer"
            title="Delete Package"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
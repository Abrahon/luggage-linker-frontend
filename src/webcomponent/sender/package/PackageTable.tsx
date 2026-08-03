"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Package as PackageIcon,
  MapPin,
  Calendar,
  Tag,
} from "lucide-react";
import { APIPackageItem } from "@/api/sender.package.api";

interface PackageTableProps {
  packages: APIPackageItem[];
  onView: (pkg: APIPackageItem) => void;
  onEdit: (pkg: APIPackageItem) => void;
  onDelete: (pkgId: string) => void;
}

export const PackageTable: React.FC<PackageTableProps> = ({
  packages,
  onView,
  onEdit,
  onDelete,
}) => {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdownId((prev) => (prev === id ? null : id));
  };

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
        className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
          statusStyles[status] || "bg-slate-50 text-slate-700 border-slate-200"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-visible">
      <div className="overflow-x-auto min-h-[320px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3.5 px-4">Package</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Route</th>
              <th className="py-3.5 px-4">Reward</th>
              <th className="py-3.5 px-4">Pickup Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700 font-medium">
            {packages.map((pkg) => {
              const isDropdownOpen = activeDropdownId === pkg.id;

              // Helper to resolve the primary or first uploaded image
              const primaryImage =
                pkg.images?.find((img) => img.is_primary)?.image ||
                pkg.images?.[0]?.image;

              return (
                <tr
                  key={pkg.id}
                  onClick={() => onView(pkg)}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  {/* Package Title, Image & Weight */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-slate-600 shrink-0">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={pkg.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if image URL is unreachable
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <PackageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {pkg.title}
                        </p>
                        <p className="text-xs text-slate-400 font-normal">
                          {pkg.weight} kg
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {pkg.category}
                    </div>
                  </td>

                  {/* Route */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[140px]">
                        {pkg.pickup_city} → {pkg.destination_city}
                      </span>
                    </div>
                  </td>

                  {/* Reward Amount */}
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    {pkg.currency} {pkg.reward_amount}
                  </td>

                  {/* Pickup Date */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {pkg.pickup_date}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">{getStatusBadge(pkg.status)}</td>

                  {/* 3-Dot Action Menu */}
                  <td
                    className="py-3.5 px-4 text-right relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="inline-block text-left"
                      ref={isDropdownOpen ? dropdownRef : null}
                    >
                      <button
                        onClick={(e) => toggleDropdown(pkg.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                        title="Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute right-4 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-left animate-in fade-in slide-in-from-top-1 duration-150">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(null);
                              onView(pkg);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            View
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(null);
                              onEdit(pkg);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-400" />
                            Edit
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(null);
                              onDelete(pkg.id);
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  APIPackageItem,
  getMyPackages,
  getPackageById,
  deletePackage,
} from "@/api/sender.package.api";
import { PackageCard } from "../../sender/card/PackageCard";
import { PackageTable } from "./PackageTable";
import { EmptyState } from "../package/EmptyState";
import { DeleteModal } from "../package/DeleteModal";
import { PackageFormModal } from "../package/PackageFormModal";

// ✅ Correct Default Import

import { PackageDetailModal } from "./PackageDetailModal";
import { Loader2, Plus, Search, RefreshCw, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";

export default function MyPackagesPage() {
  const [packageList, setPackageList] = useState<APIPackageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState<boolean>(false);

  // Layout View State ('grid' | 'table')
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  // Modal Control States
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<APIPackageItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch package list from API
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyPackages();
      const list = Array.isArray(data) ? data : (data as any)?.data || [];
      setPackageList(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch package listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Dynamic Statistics
  const totalCount = packageList.length;
  const draftCount = packageList.filter((p) => p.status === "DRAFT").length;
  const publishedCount = packageList.filter((p) => p.status === "PUBLISHED").length;
  const matchedCount = packageList.filter((p) => p.status === "MATCHED").length;
  const bookedCount = packageList.filter((p) => p.status === "BOOKED").length;
  const deliveredCount = packageList.filter((p) => p.status === "DELIVERED").length;

  // --- Modal Action Handlers ---
  const handleOpenCreate = () => {
    setSelectedPackage(null);
    setIsFormOpen(true);
  };

  // ✅ Fixed Edit Handler: Fetches full package details so form inputs populate
  const handleOpenEdit = async (pkg: APIPackageItem) => {
    try {
      setIsFetchingDetail(true);
      const fullPackageRes: any = await getPackageById(pkg.id);
      const fullPackageData = fullPackageRes?.data || fullPackageRes || pkg;
      setSelectedPackage(fullPackageData);
      setIsFormOpen(true);
    } catch (err) {
      // Fallback to table row item if detailed fetch fails
      setSelectedPackage(pkg);
      setIsFormOpen(true);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleOpenView = async (pkg: APIPackageItem) => {
    try {
      setIsFetchingDetail(true);
      const fullPackageRes: any = await getPackageById(pkg.id);
      const fullPackageData = fullPackageRes?.data || fullPackageRes || pkg;
      setSelectedPackage(fullPackageData);
      setIsDetailOpen(true);
    } catch (err) {
      setSelectedPackage(pkg);
      setIsDetailOpen(true);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  // Delete Action Integration
  const handleDeleteConfirm = async () => {
    if (!packageToDelete) return;
    try {
      setIsDeleting(true);
      await deletePackage(packageToDelete);
      setPackageList((prev) => prev.filter((p) => p.id !== packageToDelete));
      toast.success("Package deleted successfully.");
      setPackageToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete package.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Callback after modal creates/updates a package
  const handleFormSuccess = async () => {
    await fetchPackages();
    setIsFormOpen(false);
    setSelectedPackage(null);
  };

  // Filter & Sort Logic
  const filteredPackages = useMemo(() => {
    return packageList
      .filter((pkg) => {
        if (statusFilter !== "ALL" && pkg.status !== statusFilter) return false;
        if (categoryFilter !== "ALL" && pkg.category !== categoryFilter) return false;
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchTitle = pkg.title?.toLowerCase().includes(q);
          const matchCity =
            pkg.pickup_city?.toLowerCase().includes(q) ||
            pkg.destination_city?.toLowerCase().includes(q);
          return matchTitle || matchCity;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "HIGHEST_REWARD") {
          return Number(b.reward_amount || 0) - Number(a.reward_amount || 0);
        }
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
  }, [packageList, statusFilter, categoryFilter, searchQuery, sortBy]);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 antialiased text-slate-800">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Packages
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage, track, and update all your package listings seamlessly.
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={fetchPackages}
              className="p-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh Packages"
            >
              <RefreshCw className={`w-4 h-4 ${loading || isFetchingDetail ? "animate-spin text-amber-500" : ""}`} />
            </button>
            <button
              onClick={handleOpenCreate}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Create Package
            </button>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {[
            { label: "Total", count: totalCount, border: "border-slate-200", text: "text-slate-900" },
            { label: "Draft", count: draftCount, border: "border-amber-200 bg-amber-50/30", text: "text-amber-700" },
            { label: "Published", count: publishedCount, border: "border-blue-200 bg-blue-50/30", text: "text-blue-700" },
            { label: "Matched", count: matchedCount, border: "border-purple-200 bg-purple-50/30", text: "text-purple-700" },
            { label: "Booked", count: bookedCount, border: "border-orange-200 bg-orange-50/30", text: "text-orange-700" },
            { label: "Delivered", count: deliveredCount, border: "border-emerald-200 bg-emerald-50/30", text: "text-emerald-700" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`w-full p-3.5 sm:p-4 border rounded-2xl bg-white shadow-2xs flex flex-col justify-between ${stat.border}`}
            >
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                {stat.label}
              </span>
              <span className={`text-xl sm:text-2xl font-black mt-1.5 ${stat.text}`}>
                {stat.count}
              </span>
            </div>
          ))}
        </div>

        {/* Operations & Filtering Controls */}
        <div className="w-full bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3.5 items-center justify-between">
          <div className="w-full md:flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search packages by title or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl transition-all outline-hidden text-xs sm:text-sm"
            />
          </div>

          <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:bg-white focus:border-amber-500 transition-all outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="MATCHED">Matched</option>
              <option value="BOOKED">Booked</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:bg-white focus:border-amber-500 transition-all outline-hidden cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="DOCUMENT">Document</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="CLOTHING">Clothing</option>
              <option value="FOOD">Food</option>
              <option value="MEDICINE">Medicine</option>
              <option value="COSMETICS">Cosmetics</option>
              <option value="BOOKS">Books</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:bg-white focus:border-amber-500 transition-all outline-hidden cursor-pointer"
            >
              <option value="NEWEST">Newest First</option>
              <option value="HIGHEST_REWARD">Highest Reward</option>
            </select>

            {/* View Toggle Switch (Grid vs Table) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Package Content / Loading / Empty States */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-xs font-semibold">Loading package listings...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <EmptyState onCreate={handleOpenCreate} />
        ) : viewMode === "table" ? (
          <PackageTable
            packages={filteredPackages}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onDelete={(id) => setPackageToDelete(id)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                packageItem={pkg}
                onView={() => handleOpenView(pkg)}
                onEdit={() => handleOpenEdit(pkg)}
                onDelete={() => setPackageToDelete(pkg.id)}
              />
            ))}
          </div>
        )}

        {/* Modals Integration */}
        {packageToDelete && (
          <DeleteModal
            isOpen={Boolean(packageToDelete)}
            isDeleting={isDeleting}
            onClose={() => setPackageToDelete(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}

        {/* ✅ Fixed Modal Instance: Passes packageToEdit & handleFormSuccess */}
        {isFormOpen && (
          <PackageFormModal
            isOpen={isFormOpen}
            packageToEdit={selectedPackage}
            onClose={() => {
              setIsFormOpen(false);
              setSelectedPackage(null);
            }}
            onSuccess={handleFormSuccess}
          />
        )}

        {isDetailOpen && selectedPackage && (
          <PackageDetailModal
            isOpen={isDetailOpen}
            packageItem={selectedPackage}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedPackage(null);
            }}
            onRefresh={fetchPackages}
          />
        )}
      </div>
    </div>
  );
}
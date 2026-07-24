"use client";

import React, { useState, useMemo } from "react";
import { PackageCard } from "../../sender/card/PackageCard";
import { EmptyState } from "../package/EmptyState";
import { DeleteModal } from "../package/DeleteModal";
import { PackageFormModal } from "./PackageFormModal";
import { PackageDetailModal } from "./PackageDetailModal";

// Backend API JSON Interface
export interface APIPackageItem {
  id: string;
  sender: string;
  title: string;
  description: string;
  category: string;
  weight: string;
  declared_value: string;
  reward_amount: string;
  currency: string;
  pickup_country: string;
  pickup_city: string;
  pickup_address: string;
  destination_country: string;
  destination_city: string;
  destination_address: string;
  pickup_date: string;
  latest_delivery_date: string;
  is_fragile: boolean;
  requires_signature: boolean;
  is_public: boolean;
  status: string;
  is_active: boolean;
  images: Array<{
    id: string;
    image: string;
    is_primary: boolean;
    created_at: string;
  }>;
  declared_as_legal: boolean;
  terms_accepted: boolean;
  verification_status: string;
  risk_score: number;
  purchase_receipt: string | null;
  serial_number: string | null;
  imei: string | null;
  traveler_matches_listing: string | null;
  traveler_refusal_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Initial Mock Seed
const MOCK_API_RESPONSE: APIPackageItem[] = [
  {
    id: "7c05fee2-44df-4853-8192-b688352cb424",
    sender: "222dea2d-1cd1-4360-b045-89bcb0126326",
    title: "MacBook Pro 16-inch",
    description: "Brand new MacBook Pro in its original sealed box.",
    category: "ELECTRONICS",
    weight: "2.30",
    declared_value: "2500.00",
    reward_amount: "80.00",
    currency: "USD",
    pickup_country: "Bangladesh",
    pickup_city: "Dhaka",
    pickup_address: "Banani, Dhaka",
    destination_country: "Italy",
    destination_city: "Milan",
    destination_address: "Canary Wharf",
    pickup_date: "2026-07-15",
    latest_delivery_date: "2026-07-25",
    is_fragile: true,
    requires_signature: true,
    is_public: true,
    status: "DRAFT",
    is_active: true,
    images: [
      {
        id: "d2381851-3f2b-4c55-9d5a-de41af240f43",
        image:
          "https://res.cloudinary.com/dc96x5mdn/image/upload/v1783567347/packages/jjx1odevb47yihp6dz9s.jpg",
        is_primary: true,
        created_at: "2026-07-09T03:22:28.002496Z",
      },
    ],
    declared_as_legal: true,
    terms_accepted: true,
    verification_status: "PENDING",
    risk_score: 15,
    purchase_receipt: null,
    serial_number: "C02G1234MD6R",
    imei: null,
    traveler_matches_listing: null,
    traveler_refusal_reason: null,
    created_at: "2026-07-09T03:21:38.725022Z",
    updated_at: "2026-07-09T03:21:38.725027Z",
  },
];

export default function MyPackagesPage() {
  const [packageList, setPackageList] = useState<APIPackageItem[]>(MOCK_API_RESPONSE);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  // Modal Control States
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedPackage, setSelectedPackage] = useState<APIPackageItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Statistics
  const totalCount = packageList.length;
  const draftCount = packageList.filter((p) => p.status === "DRAFT").length;
  const publishedCount = packageList.filter((p) => p.status === "PUBLISHED").length;
  const matchedCount = packageList.filter((p) => p.status === "MATCHED").length;
  const bookedCount = packageList.filter((p) => p.status === "BOOKED").length;
  const deliveredCount = packageList.filter((p) => p.status === "DELIVERED").length;

  // --- Handlers ---
  const handleOpenCreate = () => {
    setSelectedPackage(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pkg: APIPackageItem) => {
    setSelectedPackage(pkg);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleOpenView = (pkg: APIPackageItem) => {
    setSelectedPackage(pkg);
    setIsDetailOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (packageToDelete) {
      setPackageList((prev) => prev.filter((p) => p.id !== packageToDelete));
      setPackageToDelete(null);
    }
  };

  // Submit Handler for Create / Edit Form
  const handleFormSubmit = (formData: Partial<APIPackageItem>) => {
    if (formMode === "create") {
      const newPackage: APIPackageItem = {
        id: crypto.randomUUID(),
        sender: "222dea2d-1cd1-4360-b045-89bcb0126326",
        title: formData.title || "Untitled Package",
        description: formData.description || "",
        category: formData.category || "ELECTRONICS",
        weight: formData.weight || "1.0",
        declared_value: formData.declared_value || "0.00",
        reward_amount: formData.reward_amount || "0.00",
        currency: "USD",
        pickup_country: "Bangladesh",
        pickup_city: formData.pickup_city || "Dhaka",
        pickup_address: formData.pickup_address || "Standard Address",
        destination_country: "Italy",
        destination_city: formData.destination_city || "Milan",
        destination_address: formData.destination_address || "Standard Destination",
        pickup_date: new Date().toISOString().split("T")[0],
        latest_delivery_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        is_fragile: false,
        requires_signature: true,
        is_public: true,
        status: "DRAFT",
        is_active: true,
        images: [],
        declared_as_legal: true,
        terms_accepted: true,
        verification_status: "PENDING",
        risk_score: 10,
        purchase_receipt: null,
        serial_number: null,
        imei: null,
        traveler_matches_listing: null,
        traveler_refusal_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setPackageList((prev) => [newPackage, ...prev]);
    } else if (formMode === "edit" && selectedPackage) {
      setPackageList((prev) =>
        prev.map((pkg) =>
          pkg.id === selectedPackage.id
            ? {
                ...pkg,
                ...formData,
                updated_at: new Date().toISOString(),
              }
            : pkg
        )
      );
    }
    setIsFormOpen(false);
  };

  // Filter & Sort Logic
  const filteredPackages = useMemo(() => {
    return packageList
      .filter((pkg) => {
        if (statusFilter !== "ALL" && pkg.status !== statusFilter) return false;
        if (categoryFilter !== "ALL" && pkg.category !== categoryFilter) return false;
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchTitle = pkg.title.toLowerCase().includes(q);
          const matchCity =
            pkg.pickup_city.toLowerCase().includes(q) ||
            pkg.destination_city.toLowerCase().includes(q);
          return matchTitle || matchCity;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "HIGHEST_REWARD") {
          return parseFloat(b.reward_amount) - parseFloat(a.reward_amount);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [packageList, statusFilter, categoryFilter, searchQuery, sortBy]);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 antialiased text-slate-800">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Section */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Packages
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage, track, and update all your package listings seamlessly.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="text-base font-bold leading-none">+</span> Create Package
          </button>
        </div>

        {/* Stats Grid */}
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

        {/* Operations & Filtering Row */}
        <div className="w-full bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3.5 items-center justify-between">
          <div className="w-full md:flex-1">
            <input
              type="text"
              placeholder="Search packages by title or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 rounded-xl transition-all outline-hidden text-xs sm:text-sm"
            />
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-600 transition-all outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="MATCHED">Matched</option>
              <option value="BOOKED">Booked</option>
              <option value="DELIVERED">Delivered</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-600 transition-all outline-hidden cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="COSMETICS">Cosmetics</option>
              <option value="CLOTHING">Clothing</option>
              <option value="DOCUMENTS">Documents</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-600 transition-all outline-hidden cursor-pointer"
            >
              <option value="NEWEST">Newest First</option>
              <option value="HIGHEST_REWARD">Highest Reward</option>
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {filteredPackages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                packageItem={{
                  id: pkg.id,
                  image: pkg.images[0]?.image || "",
                  title: pkg.title,
                  category: pkg.category,
                  reward: parseFloat(pkg.reward_amount),
                  weight: parseFloat(pkg.weight),
                  declaredValue: parseFloat(pkg.declared_value),
                  pickup: `${pkg.pickup_city}, ${pkg.pickup_country}`,
                  destination: `${pkg.destination_city}, ${pkg.destination_country}`,
                  status: pkg.status,
                  isVerified: pkg.verification_status === "VERIFIED",
                  risk: pkg.risk_score < 30 ? "Low" : pkg.risk_score < 70 ? "Medium" : "High",
                }}
                onView={() => handleOpenView(pkg)}
                onEdit={() => handleOpenEdit(pkg)}
                onDeleteRequest={(id) => setPackageToDelete(id)}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={packageToDelete !== null}
          onClose={() => setPackageToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />

        {/* Create / Edit Form Modal */}
        <PackageFormModal
          isOpen={isFormOpen}
          mode={formMode}
          initialData={selectedPackage}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
        />

        {/* View Details Modal */}
        <PackageDetailModal
          isOpen={isDetailOpen}
          packageData={selectedPackage}
          onClose={() => setIsDetailOpen(false)}
        />
      </div>
    </div>
  );
}
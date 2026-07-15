"use client"; // Required for state management in Next.js App Router
import React, { useState } from "react";
import { PackageCard } from "../../sender/card/PackageCard";
import { EmptyState } from "../package/EmptyState";
import { DeleteModal } from "../package/DeleteModal";


const INITIAL_PACKAGES = [
  {
    id: "pkg-001",
    image: "", 
    title: "MacBook Pro 16\"",
    category: "Electronics",
    reward: 45,
    weight: 2,
    declaredValue: 1200,
    pickup: "New York",
    destination: "London",
    status: "PUBLISHED",
    isVerified: true,
    risk: "Medium",
  },
  {
    id: "pkg-002",
    image: "",
    title: "Chanel Coco Mademoiselle",
    category: "Cosmetics",
    reward: 20,
    weight: 0.5,
    declaredValue: 150,
    pickup: "Paris",
    destination: "Dhaka",
    status: "MATCHED",
    isVerified: true,
    risk: "Low",
  }
];

export default function MyPackagesPage() {
  const [packages, setPackages] = useState(INITIAL_PACKAGES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);

  const totalCount = packages.length;
  const publishedCount = packages.filter(p => p.status === "PUBLISHED").length;
  const matchedCount = packages.filter(p => p.status === "MATCHED").length;
  const bookedCount = packages.filter(p => p.status === "BOOKED").length;
  const deliveredCount = packages.filter(p => p.status === "DELIVERED").length;

  const handleDeleteConfirm = () => {
    if (packageToDelete) {
      setPackages(packages.filter(p => p.id !== packageToDelete));
      setPackageToDelete(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/50 py-6 px-4 md:px-8 antialiased text-slate-800">
      
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Packages</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, track, and update all your package listings</p>
        </div>
        <button className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all hover:shadow duration-150 flex items-center justify-center gap-2">
          <span className="text-lg font-bold leading-none">+</span> Create Package
        </button>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 my-8">
        {[
          { label: "Total", count: totalCount, border: "border-slate-200", text: "text-slate-900" },
          { label: "Published", count: publishedCount, border: "border-blue-200 bg-blue-50/30", text: "text-blue-700" },
          { label: "Matched", count: matchedCount, border: "border-purple-200 bg-purple-50/30", text: "text-purple-700" },
          { label: "Booked", count: bookedCount, border: "border-orange-200 bg-orange-50/30", text: "text-orange-700" },
          { label: "Delivered", count: deliveredCount, border: "border-emerald-200 bg-emerald-50/30", text: "text-emerald-700" },
        ].map((stat, idx) => (
          <div key={idx} className={`p-4 border rounded-2xl bg-white shadow-sm flex flex-col justify-between ${stat.border}`}>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
            <span className={`text-2xl font-bold mt-2 ${stat.text}`}>{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Modern Operations Filtering Interface */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl transition-all outline-none text-sm"
          />
        </div>

        <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:bg-white focus:border-blue-500 transition-all outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="MATCHED">Matched</option>
            <option value="BOOKED">Booked</option>
            <option value="DELIVERED">Delivered</option>
          </select>

          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:bg-white focus:border-blue-500 transition-all outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Cosmetics">Cosmetics</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:bg-white focus:border-blue-500 transition-all outline-none"
          >
            <option value="NEWEST">Newest First</option>
            <option value="HIGHEST_REWARD">Highest Reward</option>
          </select>
        </div>
      </div>

      {/* Card Grid Container */}
      {packages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard 
              key={pkg.id} 
              packageItem={pkg} 
              onDeleteRequest={(id) => setPackageToDelete(id)} 
            />
          ))}
        </div>
      )}

      <DeleteModal 
        isOpen={packageToDelete !== null} 
        onClose={() => setPackageToDelete(null)} 
        onConfirm={handleDeleteConfirm} 
      />
    </div>
  );
}
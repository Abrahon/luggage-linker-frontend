"use client";

import React from "react";
import { APIPackageItem } from "./MyPackagesPage";

// Extended interface with API Data structure
interface PackageDetailPageProps {
  packageData?: APIPackageItem;
  onBack?: () => void;
}

const MOCK_DETAIL_DATA: APIPackageItem = {
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
  status: "MATCHED",
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
  verification_status: "VERIFIED",
  risk_score: 15,
  purchase_receipt: "https://example.com/receipt.pdf",
  serial_number: "C02G1234MD6R",
  imei: "356894512345678",
  traveler_matches_listing: null,
  traveler_refusal_reason: null,
  created_at: "2026-07-09T03:21:38.725022Z",
  updated_at: "2026-07-09T03:21:38.725027Z",
};

const TIMELINE_STEPS = [
  { step: "DRAFT", label: "Draft" },
  { step: "PUBLISHED", label: "Published" },
  { step: "MATCHED", label: "Matched" },
  { step: "BOOKED", label: "Booked" },
  { step: "IN_TRANSIT", label: "In Transit" },
  { step: "DELIVERED", label: "Delivered" },
];

export const PackageDetailPage: React.FC<PackageDetailPageProps> = ({
  packageData = MOCK_DETAIL_DATA,
  onBack,
}) => {
  const currentStatusIndex = TIMELINE_STEPS.findIndex(
    (t) => t.step === packageData.status
  );

  return (
    <div className="w-full min-h-screen bg-slate-50/50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8 antialiased text-slate-800">
      <div className="w-full max-w-7xl mx-auto space-y-6">

        {/* Back Button and Navigation Actions Row */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={onBack}
            className="text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
          >
            ← Back to Packages
          </button>
          <button className="px-3.5 py-2 border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 text-xs sm:text-sm rounded-xl transition-colors cursor-pointer">
            Edit Listing
          </button>
        </div>

        {/* Hero Cover Header Panel (100% Mobile Responsive) */}
        <div className="w-full bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs">
          <div className="w-full flex flex-col md:flex-row gap-5 items-center md:items-start">
            <div className="w-full md:w-44 h-44 sm:h-48 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
              <img
                src={packageData.images[0]?.image || "/placeholder.jpg"}
                alt={packageData.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold rounded-md uppercase">
                  {packageData.category}
                </span>
                <span className="px-2.5 py-0.5 bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-bold rounded-md uppercase">
                  {packageData.status}
                </span>
                <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold rounded-md">
                  {packageData.verification_status}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-2.5">
                {packageData.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                {packageData.description}
              </p>

              <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 mt-5 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Reward
                  </p>
                  <p className="text-base sm:text-xl font-extrabold text-blue-600 mt-0.5">
                    ${packageData.reward_amount}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Weight
                  </p>
                  <p className="text-base sm:text-xl font-extrabold text-slate-800 mt-0.5">
                    {packageData.weight} KG
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Value
                  </p>
                  <p className="text-base sm:text-xl font-extrabold text-slate-800 mt-0.5">
                    ${packageData.declared_value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content Split Layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left Main Content */}
          <div className="w-full lg:col-span-2 space-y-6">

            {/* Package Logistics Card */}
            <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-2xs p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Package Logistics & Addresses
              </h3>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs sm:text-sm">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">
                    Pickup Location
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    📍 {packageData.pickup_city}, {packageData.pickup_country}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{packageData.pickup_address}</p>
                  <p className="text-slate-400 text-[10px] mt-1">Date: {packageData.pickup_date}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">
                    Destination Location
                  </p>
                  <p className="font-bold text-slate-900 mt-1">
                    📍 {packageData.destination_city}, {packageData.destination_country}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{packageData.destination_address}</p>
                  <p className="text-slate-400 text-[10px] mt-1">
                    By: {packageData.latest_delivery_date}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Multi-Image Gallery */}
            <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-2xs p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Verification Attachments ({packageData.images.length})
              </h3>
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {packageData.images.map((img, index) => (
                  <div
                    key={img.id || index}
                    className="aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden relative group cursor-pointer"
                  >
                    <img
                      src={img.image}
                      alt={`Gallery ${index}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                    />
                    {img.is_primary && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white text-[9px] font-bold rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Lifecycle Progress Timeline */}
            <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-2xs p-4 sm:p-6">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 border-b border-slate-100 pb-4">
                Package Lifecycle Journey
              </h3>

              <div className="relative w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4">
                {/* Connecting Line for Desktop */}
                <div className="hidden md:block absolute left-4 right-4 top-[14px] h-1 bg-slate-100 z-0">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${
                        (Math.max(0, currentStatusIndex) / (TIMELINE_STEPS.length - 1)) * 100
                      }%`,
                    }}
                  />
                </div>

                {TIMELINE_STEPS.map((step, idx) => {
                  const isPassed = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;

                  return (
                    <div
                      key={idx}
                      className="relative z-10 flex md:flex-col items-center gap-3 md:gap-2 flex-1 w-full md:text-center"
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 shrink-0 transition-all ${
                          isCurrent
                            ? "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100"
                            : isPassed
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                      >
                        {isPassed && !isCurrent ? "✓" : idx + 1}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            isCurrent
                              ? "text-blue-600"
                              : isPassed
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Security & Audit Sidebar */}
          <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-2xs p-4 sm:p-6 flex flex-col gap-4">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>🛡 Security Audit</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-md">
                Verified
              </span>
            </h3>

            <div className="w-full space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Risk Score</span>
                <span
                  className={`px-2 py-0.5 font-extrabold rounded-md ${
                    packageData.risk_score <= 30
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {packageData.risk_score}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-medium">Receipt Uploaded</span>
                <span className="font-bold text-slate-800">
                  {packageData.purchase_receipt ? "✅ Yes" : "❌ No"}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-medium">Fragile Item</span>
                <span className="font-bold text-slate-800">
                  {packageData.is_fragile ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-medium">Signature Req.</span>
                <span className="font-bold text-slate-800">
                  {packageData.requires_signature ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-medium">Serial / IMEI</span>
                <span className="font-mono font-bold text-slate-800 text-[11px] truncate max-w-[120px]">
                  {packageData.serial_number || packageData.imei || "N/A"}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-slate-400 font-medium">Legal Declaration</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100">
                  {packageData.declared_as_legal ? "Accepted" : "Pending"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
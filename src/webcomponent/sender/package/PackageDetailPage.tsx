import React from "react";
import { getStatusConfig } from "../../../lib/statusHelper";

// 1. Mocking Detail Page Specs
const DETAIL_DATA = {
  id: "pkg-001",
  title: "MacBook Pro 16\"",
  category: "Electronics",
  reward: 45,
  weight: 2,
  declaredValue: 1200,
  pickup: "New York, USA",
  destination: "London, UK",
  status: "MATCHED", // Corresponds to Timeline mapping highlights
  riskScore: 35,
  receiptUploaded: true,
  imei: "3568945XXXX",
  serialNumber: "ASD56565",
  legalDeclaration: "Accepted",
  terms: "Accepted",
  images: [
    "/placeholder-macbook.jpg",
    "/placeholder-detail-1.jpg",
    "/placeholder-detail-2.jpg",
  ]
};

// 2. Timeline Configuration Map
const TIMELINE_STEPS = [
  { step: "DRAFT", label: "Draft" },
  { step: "PUBLISHED", label: "Published" },
  { step: "MATCHED", label: "Matched" },
  { step: "BOOKED", label: "Booked" },
  { step: "IN_TRANSIT", label: "In Transit" },
  { step: "DELIVERED", label: "Delivered" },
];

export const PackageDetailPage = () => {
  const currentStatusIndex = TIMELINE_STEPS.findIndex(t => t.step === DETAIL_DATA.status);
  const statusConfig = getStatusConfig(DETAIL_DATA.status);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 py-6 px-4 md:px-8 antialiased text-slate-800">
      
      {/* Back Button and Navigation Actions Row */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <button className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
          ← Back to Packages
        </button>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 text-sm rounded-xl transition-colors">
            Edit Listing
          </button>
        </div>
      </div>

      {/* Primary 1. Hero Cover Header Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
          <div className="w-full lg:w-48 h-48 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
            <img src={DETAIL_DATA.images[0]} alt={DETAIL_DATA.title} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-md">
                {DETAIL_DATA.category}
              </span>
              <span className={`px-2.5 py-0.5 border text-xs font-bold rounded-md ${statusConfig.color}`}>
                {statusConfig.text}
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
                Verified Item
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              {DETAIL_DATA.title}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 max-w-2xl border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Reward</p>
                <p className="text-xl font-extrabold text-blue-600 mt-0.5">${DETAIL_DATA.reward}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Weight</p>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">{DETAIL_DATA.weight} KG</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Value</p>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">${DETAIL_DATA.declaredValue}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Page Content Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Double Section Column: Multi-cards Grid */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Card: Basic & Journey Details */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Package Logistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pickup Location</p>
                <p className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                  <span className="text-emerald-500">📍</span> {DETAIL_DATA.pickup}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination Location</p>
                <p className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                  <span className="text-blue-500">📍</span> {DETAIL_DATA.destination}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Dynamic Multi-Image Gallery */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Image Verification Assets</h3>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {DETAIL_DATA.images.map((img, index) => (
                <div key={index} className="aspect-square rounded-xl bg-slate-50 border border-slate-150 overflow-hidden relative group cursor-pointer">
                  <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-150" />
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/70 text-white text-[9px] font-bold rounded">Primary</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Progress Timeline Tracking Block */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-4">Package Lifecycle Journey</h3>
            
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 mt-6">
              {/* Desktop Progress Connectors Bar */}
              <div className="hidden md:block absolute left-4 right-4 top-[14px] h-1 bg-slate-100 z-0">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(currentStatusIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {TIMELINE_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;

                return (
                  <div key={idx} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 flex-1 w-full md:text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                      isCurrent 
                        ? "bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 scale-105" 
                        : isPassed 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "bg-white border-slate-200 text-slate-400"
                    }`}>
                      {isPassed && !isCurrent ? "✓" : idx + 1}
                    </div>
                    <div>
                      <p className={`text-xs font-bold transition-all ${isCurrent ? "text-blue-600 text-sm" : isPassed ? "text-slate-800" : "text-slate-400"}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Single Column Card: Security Verification Auditing details */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-5">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>🛡 Security Verification</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-md">Audited</span>
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-medium">Risk Score</span>
              <span className={`px-2 py-0.5 font-extrabold rounded-md ${DETAIL_DATA.riskScore <= 35 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                {DETAIL_DATA.riskScore}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
              <span className="text-slate-400 font-medium">Receipt Uploaded</span>
              <span className="font-bold text-slate-800">{DETAIL_DATA.receiptUploaded ? "✅ Yes" : "❌ No"}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
              <span className="text-slate-400 font-medium">IMEI Reference</span>
              <span className="font-mono font-bold text-slate-800 text-xs">{DETAIL_DATA.imei}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
              <span className="text-slate-400 font-medium">Serial Number</span>
              <span className="font-mono font-bold text-slate-800 text-xs">{DETAIL_DATA.serialNumber}</span>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
              <span className="text-slate-400 font-medium">Legal Declaration</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-100">
                {DETAIL_DATA.legalDeclaration}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
              <span className="text-slate-400 font-medium">Terms Accepted</span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded border border-emerald-100">
                {DETAIL_DATA.terms}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
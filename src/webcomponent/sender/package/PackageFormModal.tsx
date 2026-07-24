"use client";

import React, { useState, useEffect } from "react";
import { APIPackageItem } from "./MyPackagesPage";

interface PackageData {
  id?: string | number;
  title: string;
  category: string;
  weight: string;
  declared_value: string;
  reward_amount: string;
  pickup_city: string;
  destination_city: string;
  description: string;
}

interface PackageFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: any; 
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

export const PackageFormModal: React.FC<PackageFormModalProps> = ({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<PackageData>({
    title: "",
    category: "ELECTRONICS",
    weight: "",
    declared_value: "",
    reward_amount: "",
    pickup_city: "",
    destination_city: "",
    description: "",
  });

  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData(initialData);
    } else {
      setFormData({
        title: "",
        category: "ELECTRONICS",
        weight: "",
        declared_value: "",
        reward_amount: "",
        pickup_city: "",
        destination_city: "",
        description: "",
      });
    }
  }, [initialData, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl border border-slate-200 z-10 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {mode === "create" ? "✨ Create New Package" : "✏️ Edit Package"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. MacBook Pro 16-inch"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
              >
                <option value="ELECTRONICS">Electronics</option>
                <option value="COSMETICS">Cosmetics</option>
                <option value="CLOTHING">Clothing</option>
                <option value="DOCUMENTS">Documents</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Weight (KG)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="2.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Declared Value ($)</label>
              <input
                type="number"
                required
                placeholder="2500"
                value={formData.declared_value}
                onChange={(e) => setFormData({ ...formData, declared_value: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Reward Amount ($)</label>
              <input
                type="number"
                required
                placeholder="80"
                value={formData.reward_amount}
                onChange={(e) => setFormData({ ...formData, reward_amount: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pickup City</label>
              <input
                type="text"
                required
                placeholder="Dhaka"
                value={formData.pickup_city}
                onChange={(e) => setFormData({ ...formData, pickup_city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Destination City</label>
              <input
                type="text"
                required
                placeholder="Milan"
                value={formData.destination_city}
                onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Provide item details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
            />
          </div>

          <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
            >
              {mode === "create" ? "Create Package" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
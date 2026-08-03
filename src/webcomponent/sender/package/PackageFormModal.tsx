"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Package as PackageIcon,
  Upload,
  X,
  Star,
  GripVertical,
  Loader2,
  Sparkles,
  Truck,
  FileCheck2,
} from "lucide-react";
import {
  createPackage,
  updatePackage,
  uploadPackageImage,
  uploadPackageImagesParallel,
  deletePackageImage,
  getPackageById,
  CreatePackagePayload,
  PackageCategory,
  APIPackageItem,
} from "@/api/sender.package.api";
import { toast } from "sonner";

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (pkg: APIPackageItem) => void;
  packageToEdit?: APIPackageItem | null;
}

interface LocalImageItem {
  id: string;
  serverId?: string;
  file?: File;
  previewUrl: string;
  isPrimary: boolean;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
}

const CATEGORY_OPTIONS: { label: string; value: PackageCategory }[] = [
  { label: "Document / Legal File", value: "DOCUMENT" },
  { label: "Electronics & Gadgets", value: "ELECTRONICS" },
  { label: "Clothing & Apparel", value: "CLOTHING" },
  { label: "Food & Consumables", value: "FOOD" },
  { label: "Medicine & Pharmaceuticals", value: "MEDICINE" },
  { label: "Cosmetics & Beauty Products", value: "COSMETICS" },
  { label: "Books & Printed Media", value: "BOOKS" },
  { label: "Other / General Merchandise", value: "OTHER" },
];

export function PackageFormModal({
  isOpen,
  onClose,
  onSuccess,
  packageToEdit,
}: PackageFormModalProps) {
  const isEditMode = Boolean(packageToEdit?.id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "DOCUMENT" as PackageCategory,
    weight: "",
    declared_value: "",
    reward_amount: "",
    currency: "USD",
    pickup_country: "United States",
    pickup_city: "",
    pickup_address: "",
    destination_country: "Germany",
    destination_city: "",
    destination_address: "",
    pickup_date: "",
    latest_delivery_date: "",
    is_fragile: false,
    requires_signature: false,
    is_public: true,
    declared_as_legal: false,
    terms_accepted: false,
    serial_number: "",
    imei: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<LocalImageItem[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<
    "idle" | "creating" | "uploading" | "verifying"
  >("idle");

  const dragItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (packageToEdit && isEditMode) {
      const formatDateForInput = (dateStr?: string) => {
        if (!dateStr) return "";
        return dateStr.split("T")[0];
      };

      setFormData({
        title: packageToEdit.title || "",
        description: packageToEdit.description || "",
        category: (packageToEdit.category as PackageCategory) || "DOCUMENT",
        weight:
          packageToEdit.weight !== undefined && packageToEdit.weight !== null
            ? String(packageToEdit.weight)
            : "",
        declared_value:
          packageToEdit.declared_value !== undefined &&
          packageToEdit.declared_value !== null
            ? String(packageToEdit.declared_value)
            : "",
        reward_amount:
          packageToEdit.reward_amount !== undefined &&
          packageToEdit.reward_amount !== null
            ? String(packageToEdit.reward_amount)
            : "",
        currency: packageToEdit.currency || "USD",
        pickup_country: packageToEdit.pickup_country || "United States",
        pickup_city: packageToEdit.pickup_city || "",
        pickup_address: packageToEdit.pickup_address || "",
        destination_country: packageToEdit.destination_country || "Germany",
        destination_city: packageToEdit.destination_city || "",
        destination_address: packageToEdit.destination_address || "",
        pickup_date: formatDateForInput(packageToEdit.pickup_date),
        latest_delivery_date: formatDateForInput(
          packageToEdit.latest_delivery_date
        ),
        is_fragile: Boolean(packageToEdit.is_fragile),
        requires_signature: Boolean(packageToEdit.requires_signature),
        is_public:
          packageToEdit.is_public !== undefined
            ? Boolean(packageToEdit.is_public)
            : true,
        declared_as_legal: Boolean(packageToEdit.declared_as_legal),
        terms_accepted: Boolean(packageToEdit.terms_accepted),
        serial_number: packageToEdit.serial_number || "",
        imei: packageToEdit.imei || "",
      });

      if (packageToEdit.images && Array.isArray(packageToEdit.images)) {
        setImages(
          packageToEdit.images.map((img: any) => ({
            id: img.id,
            serverId: img.id,
            previewUrl:
              typeof img === "string" ? img : img.image || img.url || "",
            isPrimary: Boolean(img.is_primary),
            progress: 100,
            status: "success",
          }))
        );
      } else {
        setImages([]);
      }
    } else {
      setFormData({
        title: "",
        description: "",
        category: "DOCUMENT",
        weight: "",
        declared_value: "",
        reward_amount: "",
        currency: "USD",
        pickup_country: "United States",
        pickup_city: "",
        pickup_address: "",
        destination_country: "Germany",
        destination_city: "",
        destination_address: "",
        pickup_date: "",
        latest_delivery_date: "",
        is_fragile: false,
        requires_signature: false,
        is_public: true,
        declared_as_legal: false,
        terms_accepted: false,
        serial_number: "",
        imei: "",
      });
      setImages([]);
      setDeletedImageIds([]);
    }

    setFieldErrors({});
    setSubmitStep("idle");
  }, [isOpen, packageToEdit, isEditMode]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    if (images.length + fileArray.length > 5) {
      toast.error("Maximum 5 images allowed per package.");
      return;
    }

    for (const file of fileArray) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 10MB limit.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);

      setImages((prev) => {
        const isFirst = prev.length === 0;
        return [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            file,
            previewUrl,
            isPrimary: isFirst,
            progress: 0,
            status: "idle",
          },
        ];
      });
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.serverId) {
        setDeletedImageIds((d) => [...d, target.serverId!]);
      }
      if (target?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      const filtered = prev.filter((img) => img.id !== id);
      if (target?.isPrimary && filtered.length > 0) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const setPrimaryImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  const handleSortEnd = () => {
    if (
      dragItemIndex.current !== null &&
      dragOverItemIndex.current !== null &&
      dragItemIndex.current !== dragOverItemIndex.current
    ) {
      const copy = [...images];
      const draggedItem = copy[dragItemIndex.current];
      copy.splice(dragItemIndex.current, 1);
      copy.splice(dragOverItemIndex.current, 0, draggedItem);

      setImages(
        copy.map((img, idx) => ({
          ...img,
          isPrimary: idx === 0,
        }))
      );
    }
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim() || formData.title.length < 5) {
      errors.title = "Title must be at least 5 characters.";
    }
    if (!formData.description.trim() || formData.description.length < 20) {
      errors.description = "Description must be at least 20 characters.";
    }
    if (!formData.weight || Number(formData.weight) <= 0) {
      errors.weight = "Enter a valid weight.";
    }
    if (!formData.declared_value || Number(formData.declared_value) <= 0) {
      errors.declared_value = "Declared value required.";
    }
    if (!formData.reward_amount || Number(formData.reward_amount) <= 0) {
      errors.reward_amount = "Enter a valid reward amount.";
    }
    if (!formData.pickup_city.trim()) errors.pickup_city = "Pickup city required.";
    if (!formData.pickup_address.trim()) errors.pickup_address = "Pickup address required.";
    if (!formData.destination_city.trim()) errors.destination_city = "Destination city required.";
    if (!formData.destination_address.trim()) errors.destination_address = "Destination address required.";
    if (!formData.pickup_date) errors.pickup_date = "Pickup date required.";
    if (!formData.latest_delivery_date) errors.latest_delivery_date = "Latest delivery date required.";

    if (formData.category === "ELECTRONICS") {
      if (!formData.serial_number.trim()) errors.serial_number = "Serial number required.";
      if (!formData.imei.trim()) errors.imei = "IMEI required.";
    }

    if (!formData.declared_as_legal) errors.declared_as_legal = "Legal declaration required.";
    if (!formData.terms_accepted) errors.terms_accepted = "Terms acceptance required.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateTotalProgress = (): number => {
    const queued = images.filter((img) => img.file && !img.serverId);
    if (queued.length === 0) return 100;
    const total = queued.reduce((acc, curr) => acc + curr.progress, 0);
    return Math.round(total / queued.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setSubmitStep("creating");

      let finalPackage: APIPackageItem | null = null;

      if (isEditMode && packageToEdit?.id) {
        const targetPackageId = packageToEdit.id;

        // Step 1: Update metadata
        const updateRes: any = await updatePackage(
          targetPackageId,
          formData as Partial<CreatePackagePayload>
        );

        // Step 2: Clean up deleted images
        if (deletedImageIds.length > 0) {
          await Promise.all(
            deletedImageIds.map((imageId) =>
              deletePackageImage(targetPackageId, imageId)
            )
          );
        }

        // Step 3: Process dynamic parallel image uploads
        const newFilesToUpload = images.filter((img) => img.file);
        if (newFilesToUpload.length > 0) {
          setSubmitStep("uploading");
          await uploadPackageImagesParallel(
            targetPackageId,
            newFilesToUpload.map((img) => ({
              file: img.file as File,
              isPrimary: Boolean(img.isPrimary),
            })),
            (fileIndex, percent) => {
              setImages((prev) => {
                const next = [...prev];
                const targetIdx = next.findIndex(
                  (i) => i.id === newFilesToUpload[fileIndex]?.id
                );
                if (targetIdx !== -1) {
                  next[targetIdx] = {
                    ...next[targetIdx],
                    progress: percent,
                    status: percent === 100 ? "success" : "uploading",
                  };
                }
                return next;
              });
            }
          );
        }

        setSubmitStep("verifying");
        finalPackage =
          (await getPackageById(targetPackageId)) || updateRes?.data || updateRes;

        const successMessage =
          updateRes?.message ||
          updateRes?.data?.message ||
          "Package updated successfully!";
        toast.success(successMessage);
      } else {
        // --- CREATE MODE ---
        const createRes: any = await createPackage(
          formData as CreatePackagePayload
        );
        const targetPackageId = createRes?.data?.id || createRes?.id;

        if (targetPackageId) {
          const newFilesToUpload = images.filter((img) => img.file);
          if (newFilesToUpload.length > 0) {
            setSubmitStep("uploading");
            await uploadPackageImagesParallel(
              targetPackageId,
              newFilesToUpload.map((img) => ({
                file: img.file as File,
                isPrimary: Boolean(img.isPrimary),
              })),
              (fileIndex, percent) => {
                setImages((prev) => {
                  const next = [...prev];
                  const targetIdx = next.findIndex(
                    (i) => i.id === newFilesToUpload[fileIndex]?.id
                  );
                  if (targetIdx !== -1) {
                    next[targetIdx] = {
                      ...next[targetIdx],
                      progress: percent,
                      status: percent === 100 ? "success" : "uploading",
                    };
                  }
                  return next;
                });
              }
            );
          }

          setSubmitStep("verifying");
          finalPackage =
            (await getPackageById(targetPackageId)) ||
            createRes?.data ||
            createRes;
        }

        const successMessage =
          createRes?.message ||
          createRes?.data?.message ||
          "Package created successfully!";
        toast.success(successMessage);
      }

      if (onSuccess && finalPackage) {
        onSuccess(finalPackage);
      }
      onClose();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to submit package. Please check your inputs.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      setSubmitStep("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <PackageIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditMode ? "Edit Package Information" : "Create New Package"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isEditMode
                  ? "Update your shipment parameters and manage attached media."
                  : "Fill in shipment details to find matches on our platform."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[75vh] overflow-y-auto">
          {/* Item Essentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              1. Item Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Package Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. MacBook Pro 16 Inch with Leather Case"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all ${
                    fieldErrors.title
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 2.5"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.weight
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {fieldErrors.weight && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.weight}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Item Description *
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide details about the item condition, size, special instructions..."
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.description
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {fieldErrors.description && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Category Dynamic Extra Fields */}
            {formData.category === "ELECTRONICS" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                    placeholder="e.g. C02G1234MD6R"
                    className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.serial_number
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  {fieldErrors.serial_number && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.serial_number}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    IMEI Number *
                  </label>
                  <input
                    type="text"
                    name="imei"
                    value={formData.imei}
                    onChange={handleChange}
                    placeholder="e.g. 352094081234567"
                    className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.imei
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  {fieldErrors.imei && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.imei}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Valuation & Reward */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              2. Valuation & Reward
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Declared Value ($) *
                </label>
                <input
                  type="number"
                  name="declared_value"
                  value={formData.declared_value}
                  onChange={handleChange}
                  placeholder="e.g. 1200"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.declared_value
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {fieldErrors.declared_value && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.declared_value}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Traveler Reward ($) *
                </label>
                <input
                  type="number"
                  name="reward_amount"
                  value={formData.reward_amount}
                  onChange={handleChange}
                  placeholder="e.g. 150"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.reward_amount
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {fieldErrors.reward_amount && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.reward_amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Logistics & Route */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              3. Pickup & Destination
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup Side */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Truck className="w-4 h-4 text-blue-500" /> Pickup Location
                </div>
                <div>
                  <input
                    type="text"
                    name="pickup_city"
                    value={formData.pickup_city}
                    onChange={handleChange}
                    placeholder="Pickup City *"
                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.pickup_city
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="pickup_address"
                    value={formData.pickup_address}
                    onChange={handleChange}
                    placeholder="Pickup Address *"
                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.pickup_address
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Ready for Pickup Date *
                  </label>
                  <input
                    type="date"
                    name="pickup_date"
                    value={formData.pickup_date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.pickup_date
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                </div>
              </div>

              {/* Destination Side */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <Truck className="w-4 h-4 text-emerald-500" /> Destination Location
                </div>
                <div>
                  <input
                    type="text"
                    name="destination_city"
                    value={formData.destination_city}
                    onChange={handleChange}
                    placeholder="Destination City *"
                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.destination_city
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="destination_address"
                    value={formData.destination_address}
                    onChange={handleChange}
                    placeholder="Destination Address *"
                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.destination_address
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Latest Delivery Date *
                  </label>
                  <input
                    type="date"
                    name="latest_delivery_date"
                    value={formData.latest_delivery_date}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.latest_delivery_date
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                4. Package Photos (Max 5)
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {images.length}/5 Attached
              </span>
            </div>

            {/* Drop Zone */}
            {images.length < 5 && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
                }}
                className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                  dragActive
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && processFiles(e.target.files)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 mb-2">
                  <Upload className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Click or drag images to upload
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  JPG, PNG, WEBP up to 10MB each
                </p>
              </div>
            )}

            {/* Image Previews Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => (dragItemIndex.current = index)}
                    onDragEnter={() => (dragOverItemIndex.current = index)}
                    onDragEnd={handleSortEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      src={img.previewUrl}
                      alt="Package preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Progress Bar Overlay */}
                    {img.status === "uploading" && (
                      <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center p-2 text-white">
                        <Loader2 className="w-5 h-5 animate-spin mb-1" />
                        <span className="text-xs font-semibold">{img.progress}%</span>
                      </div>
                    )}

                    {/* Primary Badge */}
                    {img.isPrimary && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <Star className="w-3 h-3 fill-current" /> Main
                      </span>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(img.id)}
                        title="Set as Primary"
                        className={`p-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:scale-110 transition-transform ${
                          img.isPrimary ? "text-amber-500" : "text-slate-600"
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        title="Remove image"
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-800/90 text-red-600 hover:scale-110 transition-transform"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="absolute bottom-1 right-1 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety & Compliance */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="declared_as_legal"
                checked={formData.declared_as_legal}
                onChange={handleChange}
                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300">
                I declare that this package contains no illegal items, hazardous
                materials, or contraband under local and international transport
                laws. *
              </span>
            </label>
            {fieldErrors.declared_as_legal && (
              <p className="text-xs text-red-500">{fieldErrors.declared_as_legal}</p>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="terms_accepted"
                checked={formData.terms_accepted}
                onChange={handleChange}
                className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300">
                I accept the platform safety policies and peer-to-peer delivery
                terms. *
              </span>
            </label>
            {fieldErrors.terms_accepted && (
              <p className="text-xs text-red-500">{fieldErrors.terms_accepted}</p>
            )}
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {submitStep === "creating" && "Saving details..."}
                    {submitStep === "uploading" &&
                      `Uploading photos (${calculateTotalProgress()}%)...`}
                    {submitStep === "verifying" && "Finalizing package..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isEditMode ? "Update Package" : "Create Package"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
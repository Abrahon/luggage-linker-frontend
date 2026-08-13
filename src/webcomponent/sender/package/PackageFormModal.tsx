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
  Lock,
  Info,
  Calendar,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  createPackage,
  updatePackage,
  uploadPackageImagesParallel,
  deletePackageImage,
  getPackageById,
  CreatePackagePayload,
  PackageCategory,
  APIPackageItem,
} from "@/api/sender.package.api";
import { toast } from "sonner";

// Shadcn UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Model for Trip Data passed when mode === "trip"
export interface TripContextData {
  id: string;
  pickup_city: string;
  pickup_country?: string;
  destination_city: string;
  destination_country?: string;
  pickup_date: string; // ISO date string or YYYY-MM-DD
  latest_delivery_date: string;
  suggested_reward?: number;
  reward_per_kg?: number;
  available_weight_kg?: number;
  currency?: string;
}

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (pkg: APIPackageItem) => void;
  packageToEdit?: APIPackageItem | null;
  /**
   * "direct"  -> Standard mode (all fields editable)
   * "trip"    -> Route, dates, and reward locked based on selected trip
   */
  mode?: "direct" | "trip";
  tripData?: TripContextData | null;
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
  mode = "direct",
  tripData,
}: PackageFormModalProps) {
  const isEditMode = Boolean(packageToEdit?.id);
  const isTripLocked = mode === "trip" && Boolean(tripData);

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

    const formatDateForInput = (dateStr?: string) => {
      if (!dateStr) return "";
      return dateStr.split("T")[0];
    };

    if (packageToEdit && isEditMode) {
      // Edit Mode Initialization
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
      // Create Mode (Direct or Locked via Trip)
      const initialReward =
        tripData?.suggested_reward || tripData?.reward_per_kg;

      setFormData({
        title: "",
        description: "",
        category: "DOCUMENT",
        weight: "",
        declared_value: "",
        reward_amount:
          isTripLocked && initialReward ? String(initialReward) : "",
        currency: isTripLocked && tripData?.currency ? tripData.currency : "USD",
        pickup_country:
          isTripLocked && tripData?.pickup_country
            ? tripData.pickup_country
            : "United States",
        pickup_city:
          isTripLocked && tripData?.pickup_city ? tripData.pickup_city : "",
        pickup_address: "",
        destination_country:
          isTripLocked && tripData?.destination_country
            ? tripData.destination_country
            : "Germany",
        destination_city:
          isTripLocked && tripData?.destination_city
            ? tripData.destination_city
            : "",
        destination_address: "",
        pickup_date:
          isTripLocked && tripData?.pickup_date
            ? formatDateForInput(tripData.pickup_date)
            : "",
        latest_delivery_date:
          isTripLocked && tripData?.latest_delivery_date
            ? formatDateForInput(tripData.latest_delivery_date)
            : "",
        is_fragile: false,
        requires_signature: false,
        is_public: !isTripLocked, // If trip locked, it's specific to this trip
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
  }, [isOpen, packageToEdit, isEditMode, mode, tripData, isTripLocked]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    // Prevent changing locked parameters in Trip Mode
    if (
      isTripLocked &&
      [
        "pickup_country",
        "pickup_city",
        "destination_country",
        "destination_city",
        "pickup_date",
        "latest_delivery_date",
        "reward_amount",
        "currency",
      ].includes(name)
    ) {
      return;
    }

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
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
    } else if (
      isTripLocked &&
      tripData?.available_weight_kg &&
      Number(formData.weight) > tripData.available_weight_kg
    ) {
      errors.weight = `Weight exceeds available traveler capacity (${tripData.available_weight_kg} kg).`;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setSubmitStep("creating");

      let finalPackage: APIPackageItem | null = null;

      // Prepare payload - attach trip ID if in Trip Mode
      const payload: CreatePackagePayload = {
        ...formData,
        weight: Number(formData.weight),
        declared_value: Number(formData.declared_value),
        reward_amount: Number(formData.reward_amount),
        ...(isTripLocked && tripData?.id ? { trip_id: tripData.id } : {}),
      } as unknown as CreatePackagePayload;

      if (isEditMode && packageToEdit?.id) {
        const targetPackageId = packageToEdit.id;

        const updateRes: any = await updatePackage(
          targetPackageId,
          payload as Partial<CreatePackagePayload>
        );

        if (deletedImageIds.length > 0) {
          await Promise.all(
            deletedImageIds.map((imageId) =>
              deletePackageImage(targetPackageId, imageId)
            )
          );
        }

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

        toast.success(updateRes?.message || "Package updated successfully!");
      } else {
        // --- CREATE MODE ---
        const createRes: any = await createPackage(payload);
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

        toast.success(createRes?.message || "Package created successfully!");
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        {/* Header */}
        <DialogHeader className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <PackageIcon className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                {packageToEdit
                  ? "Edit Package Information"
                  : isTripLocked
                  ? "Create Package for This Trip"
                  : "Create New Package"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEditMode
                  ? "Update your shipment parameters and manage attached media."
                  : isTripLocked
                  ? "Trip route, travel schedule, and reward are fixed to match the traveler's itinerary."
                  : "Fill in shipment details to list your item on the platform."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Mode Notification Banner */}
        {isTripLocked && (
          <div className="mx-6 mt-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">
                Traveler Trip Selected
              </span>
              <span>
                Origin, destination, dates, and reward rate are automatically locked to match this specific trip itinerary.
              </span>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form
          id="package-form"
          onSubmit={handleSubmit}
          className="p-6 space-y-8 overflow-y-auto flex-1"
        >
          {/* SECTION 1: ITEM DETAILS (ALWAYS EDITABLE) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px]">
                1
              </span>
              Item Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Package Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. MacBook Pro 16 Inch with Leather Case"
                  className={`w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 transition-all ${
                    fieldErrors.title
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {fieldErrors.title && (
                  <p className="mt-1 text-[11px] text-red-500">{fieldErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder={
                    isTripLocked && tripData?.available_weight_kg
                      ? `Max ${tripData.available_weight_kg} kg`
                      : "e.g. 2.5"
                  }
                  className={`w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.weight
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {fieldErrors.weight && (
                  <p className="mt-1 text-[11px] text-red-500">{fieldErrors.weight}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide details about the item contents, condition, dimensions..."
                  className={`w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.description
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {fieldErrors.description && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {fieldErrors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Dynamic Electronics Fields */}
            {formData.category === "ELECTRONICS" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleChange}
                    placeholder="e.g. C02G1234MD6R"
                    className={`w-full px-3.5 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.serial_number
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  {fieldErrors.serial_number && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {fieldErrors.serial_number}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    IMEI Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="imei"
                    value={formData.imei}
                    onChange={handleChange}
                    placeholder="e.g. 352094081234567"
                    className={`w-full px-3.5 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 ${
                      fieldErrors.imei
                        ? "border-red-500"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  />
                  {fieldErrors.imei && (
                    <p className="mt-1 text-[11px] text-red-500">{fieldErrors.imei}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: ROUTE & DATES (LOCKED IN TRIP MODE) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px]">
                  2
                </span>
                Route & Schedule
              </h3>
              {isTripLocked && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  <Lock className="w-3 h-3" /> Locked to Trip
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup Country & City */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pickup Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="pickup_country"
                    value={formData.pickup_country}
                    onChange={handleChange}
                    disabled={isTripLocked}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs transition-all ${
                      isTripLocked
                        ? "bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700 pr-9"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {isTripLocked && (
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pickup City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="pickup_city"
                    value={formData.pickup_city}
                    onChange={handleChange}
                    disabled={isTripLocked}
                    placeholder="e.g. New York"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs transition-all ${
                      isTripLocked
                        ? "bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700 pr-9"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {isTripLocked && (
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  )}
                </div>
                {fieldErrors.pickup_city && (
                  <p className="mt-1 text-[11px] text-red-500">{fieldErrors.pickup_city}</p>
                )}
              </div>

              {/* Destination Country & City */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="destination_country"
                    value={formData.destination_country}
                    onChange={handleChange}
                    disabled={isTripLocked}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs transition-all ${
                      isTripLocked
                        ? "bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700 pr-9"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {isTripLocked && (
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="destination_city"
                    value={formData.destination_city}
                    onChange={handleChange}
                    disabled={isTripLocked}
                    placeholder="e.g. Berlin"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs transition-all ${
                      isTripLocked
                        ? "bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700 pr-9"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {isTripLocked && (
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  )}
                </div>
                {fieldErrors.destination_city && (
                  <p className="mt-1 text-[11px] text-red-500">{fieldErrors.destination_city}</p>
                )}
              </div>

              {/* Pickup & Destination Addresses (ALWAYS EDITABLE) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pickup Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pickup_address"
                  value={formData.pickup_address}
                  onChange={handleChange}
                  placeholder="Street address or meetup spot"
                  className={`w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.pickup_address
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {fieldErrors.pickup_address && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {fieldErrors.pickup_address}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="destination_address"
                  value={formData.destination_address}
                  onChange={handleChange}
                  placeholder="Street address or dropoff spot"
                  className={`w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.destination_address
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {fieldErrors.destination_address && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {fieldErrors.destination_address}
                  </p>
                )}
              </div>

              {/* Schedule Dates */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pickup Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="pickup_date"
                    value={formData.pickup_date}
                    onChange={handleChange}
                    disabled={isTripLocked}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs transition-all ${
                      isTripLocked
                        ? "bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700 pr-9"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {isTripLocked && (
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  )}
                </div>
                {fieldErrors.pickup_date && (
                  <p className="mt-1 text-[11px] text-red-500">{fieldErrors.pickup_date}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Latest Delivery Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="latest_delivery_date"
                    value={formData.latest_delivery_date}
                    onChange={handleChange}
                    disabled={isTripLocked}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs transition-all ${
                      isTripLocked
                        ? "bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700 pr-9"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {isTripLocked && (
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  )}
                </div>
                {fieldErrors.latest_delivery_date && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {fieldErrors.latest_delivery_date}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: VALUATION & REWARD */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px]">
                  3
                </span>
                Valuation & Reward
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Declared Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  name="declared_value"
                  value={formData.declared_value}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className={`w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 ${
                    fieldErrors.declared_value
                      ? "border-red-500"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                />
                {fieldErrors.declared_value && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {fieldErrors.declared_value}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Traveler Reward Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    name="reward_amount"
                    value={formData.reward_amount}
                    onChange={handleChange}
                    disabled={isTripLocked}
                    placeholder="e.g. 40"
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs transition-all ${
                      isTripLocked
                        ? "bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700 pr-9"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {isTripLocked && (
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  )}
                </div>
                {fieldErrors.reward_amount && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {fieldErrors.reward_amount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Currency
                </label>
                <div className="relative">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    disabled={isTripLocked}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs transition-all ${
                      isTripLocked
                        ? "bg-slate-100 dark:bg-slate-800/80 text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-700 pr-9"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                    }`}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                  {isTripLocked && (
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: MEDIA / IMAGES */}
          <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px]">
                4
              </span>
              Package Images
            </h3>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragActive
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Drag and drop package photos here, or{" "}
                <label className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                  browse files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files && processFiles(e.target.files)
                    }
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Upload up to 5 clear photos (PNG, JPG up to 10MB each)
              </p>
            </div>

            {/* Images List */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => (dragItemIndex.current = idx)}
                    onDragEnter={() => (dragOverItemIndex.current = idx)}
                    onDragEnd={handleSortEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`relative group rounded-xl overflow-hidden border bg-slate-100 dark:bg-slate-800 aspect-square flex flex-col items-center justify-center ${
                      img.isPrimary
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <img
                      src={img.previewUrl}
                      alt="Package preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Drag handle */}
                    <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-black/60 rounded text-white cursor-grab">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    {/* Primary Badge */}
                    {img.isPrimary && (
                      <span className="absolute top-1 right-1 bg-blue-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" /> Primary
                      </span>
                    )}

                    {/* Quick Controls Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(img.id)}
                          className="p-1.5 bg-white text-slate-900 rounded-lg text-[10px] font-medium hover:bg-slate-100"
                          title="Set as primary"
                        >
                          Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: OPTIONS & DECLARATIONS */}
          <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px]">
                5
              </span>
              Requirements & Legal Terms
            </h3>

            {/* Checkbox Options */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_fragile"
                  checked={formData.is_fragile}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Fragile Item
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="requires_signature"
                  checked={formData.requires_signature}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Signature Required on Delivery
              </label>

              {!isTripLocked && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  List publicly on marketplace
                </label>
              )}
            </div>

            {/* Legal terms checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  name="declared_as_legal"
                  checked={formData.declared_as_legal}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I declare that this package does not contain prohibited, hazardous, or illegal items under local and international laws. <span className="text-red-500">*</span>
                </span>
              </label>
              {fieldErrors.declared_as_legal && (
                <p className="text-[11px] text-red-500 pl-6">
                  {fieldErrors.declared_as_legal}
                </p>
              )}

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I accept the <span className="text-blue-600 dark:text-blue-400 underline">Terms of Service</span> and authorize space booking for this shipment. <span className="text-red-500">*</span>
                </span>
              </label>
              {fieldErrors.terms_accepted && (
                <p className="text-[11px] text-red-500 pl-6">
                  {fieldErrors.terms_accepted}
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="package-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {submitStep === "creating" && "Saving Package..."}
                {submitStep === "uploading" && "Uploading Photos..."}
                {submitStep === "verifying" && "Finalizing..."}
              </>
            ) : isEditMode ? (
              "Update Package"
            ) : isTripLocked ? (
              "Save & Continue Booking"
            ) : (
              "Create Package"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
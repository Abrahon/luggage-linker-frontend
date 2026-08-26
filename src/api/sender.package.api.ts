import axiosInstance from "@/api/axios";

// ─────────────────────────────────────────────────────────
// Enums & Types matching Backend Django TextChoices & Schemas
// ─────────────────────────────────────────────────────────

export type PackageCategory =
  | "DOCUMENT"
  | "ELECTRONICS"
  | "CLOTHING"
  | "FOOD"
  | "MEDICINE"
  | "COSMETICS"
  | "BOOKS"
  | "OTHER";

export type VerificationStatus =
  | "PENDING"
  | "AUTO_APPROVED"
  | "VERIFIED"
  | "MANUAL_REVIEW"
  | "REJECTED";

export type PackageStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "MATCHED"
  | "BOOKED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "EXPIRED";

export interface PackageImageItem {
  id: string;
  image: string;
  is_primary?: boolean;
  created_at?: string;
}

export interface PackageDashboardStats {
  total: number;
  draft: number;
  published: number;
  matched: number;
  booked: number;
  delivered: number;
}

export interface PackageDashboardStatsResponse {
  success: boolean;
  message: string;
  data: PackageDashboardStats;
}

export const getPackageDashboardStats = async (): Promise<PackageDashboardStatsResponse> => {
  const response = await axiosInstance.get<PackageDashboardStatsResponse>(
    "/api/package/dashboard-stats/"
  );
  return response.data;
};

export interface APIPackageItem {
  id: string;
  sender: string;
  title: string;
  description: string;
  category: PackageCategory;
  weight: number | string;
  declared_value: number | string;
  reward_amount: number | string;
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
  is_public?: boolean;
  declared_as_legal?: boolean;
  terms_accepted?: boolean;
  serial_number?: string;
  imei?: string;
  images?: PackageImageItem[];
  status?: PackageStatus;
  verification_status?: VerificationStatus;
  created_at?: string;
  updated_at?: string;
}

export type CreatePackagePayload = Omit<
  APIPackageItem,
  "id" | "sender" | "status" | "verification_status" | "images" | "created_at" | "updated_at"
> & {
  images?: Partial<PackageImageItem>[];
};

// ─────────────────────────────────────────────────────────
// Payload Sanitization Helpers
// ─────────────────────────────────────────────────────────

/**
 * Format string date to strict YYYY-MM-DD for Django DateField
 */
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
};

/**
 * Clean & format raw payload to match Django Model field types exactly
 */
const cleanPayload = (
  rawPayload: Partial<CreatePackagePayload>
): Omit<CreatePackagePayload, "images"> => {
  const category = (rawPayload.category as PackageCategory) || "DOCUMENT";

  return {
    title: rawPayload.title?.trim() || "",
    description: rawPayload.description?.trim() || "",
    weight: Number(rawPayload.weight) || 0,
    declared_value: Number(rawPayload.declared_value) || 0,
    reward_amount: Number(rawPayload.reward_amount) || 0,
    currency: rawPayload.currency || "USD",
    category,
    pickup_address: rawPayload.pickup_address?.trim() || "",
    pickup_city: rawPayload.pickup_city?.trim() || "",
    pickup_country: rawPayload.pickup_country?.trim() || "",
    destination_address: rawPayload.destination_address?.trim() || "",
    destination_city: rawPayload.destination_city?.trim() || "",
    destination_country: rawPayload.destination_country?.trim() || "",
    pickup_date: formatDate(rawPayload.pickup_date),
    latest_delivery_date: formatDate(rawPayload.latest_delivery_date),
    is_fragile: Boolean(rawPayload.is_fragile),
    requires_signature: Boolean(rawPayload.requires_signature),
    is_public: rawPayload.is_public !== undefined ? Boolean(rawPayload.is_public) : true,
    declared_as_legal: Boolean(rawPayload.declared_as_legal),
    terms_accepted: Boolean(rawPayload.terms_accepted),
    serial_number: category === "ELECTRONICS" ? rawPayload.serial_number?.trim() || undefined : undefined,
    imei: category === "ELECTRONICS" ? rawPayload.imei?.trim() || undefined : undefined,
  };
};

// ─────────────────────────────────────────────────────────
// API Service Methods
// ─────────────────────────────────────────────────────────

/**
 * 1. GET /api/my/package/
 * Retrieve packages owned by current user
 */
export const getMyPackages = async (): Promise<APIPackageItem[]> => {
  const response = await axiosInstance.get("/api/my/package/");
  const resData = response.data;
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData?.results)) return resData.results;
  if (Array.isArray(resData?.data)) return resData.data;
  return [];
};

/**
 * 2. POST /api/create/package/
 * Create base package entity
 */
export const createPackage = async (
  payload: Partial<CreatePackagePayload>
): Promise<APIPackageItem> => {
  const sanitizedPayload = cleanPayload(payload);
  const createPayload = {
    title: sanitizedPayload.title,
    description: sanitizedPayload.description,
    category: sanitizedPayload.category,
    weight: sanitizedPayload.weight,
    pickup_country: sanitizedPayload.pickup_country,
    pickup_city: sanitizedPayload.pickup_city,
    pickup_address: sanitizedPayload.pickup_address,
    destination_country: sanitizedPayload.destination_country,
    destination_city: sanitizedPayload.destination_city,
    destination_address: sanitizedPayload.destination_address,
    pickup_date: sanitizedPayload.pickup_date,
    latest_delivery_date: sanitizedPayload.latest_delivery_date,
    declared_as_legal: sanitizedPayload.declared_as_legal,
    terms_accepted: sanitizedPayload.terms_accepted,
  };
  const response = await axiosInstance.post(
    "/api/create/package/",
    createPayload
  );
  return response.data?.data || response.data;
};

/**
 * 3. GET /api/package/{id}/
 * Retrieve package details with images
 */
export const getPackageById = async (id: string): Promise<APIPackageItem> => {
  const response = await axiosInstance.get(`/api/package/${id}/`);
  return response.data?.data || response.data;
};

/**
 * 4. PATCH /api/package/{id}/manage/
 * Update existing package entity
 */
export const updatePackage = async (
  id: string,
  payload: Partial<CreatePackagePayload>
): Promise<APIPackageItem> => {
  const sanitizedPayload = cleanPayload(payload);
  const response = await axiosInstance.patch(
    `/api/package/${id}/manage/`,
    sanitizedPayload
  );
  return response.data?.data || response.data;
};

/**
 * 5. DELETE /api/package/{id}/manage/
 * Delete a package entity
 */
export const deletePackage = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/package/${id}/manage/`);
};

/**
 * 6. POST /api/package/{id}/images/
 * Upload single image with progress tracking
 */
export const uploadPackageImage = async (
  packageId: string,
  imageFile: File,
  isPrimary: boolean = false,
  onProgress?: (percent: number) => void
): Promise<PackageImageItem> => {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("is_primary", String(isPrimary));

  // ✅ Used .post method to match backend requirements and avoid 405 Method Not Allowed
  const response = await axiosInstance.post(
    `/api/package/${packageId}/images/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
    }
  );

  return response.data?.data || response.data;
};

/**
 * Helper: Upload multiple package images concurrently using Promise.all
 */
export const uploadPackageImagesParallel = async (
  packageId: string,
  filesWithPrimary: { file: File; isPrimary: boolean }[],
  onProgress?: (fileIndex: number, percent: number) => void
): Promise<PackageImageItem[]> => {
  const uploadPromises = filesWithPrimary.map((item, index) =>
    uploadPackageImage(packageId, item.file, item.isPrimary, (percent) => {
      if (onProgress) onProgress(index, percent);
    })
  );

  return Promise.all(uploadPromises);
};

/**
 * 7. GET /api/package/{id}/images/
 * Fetch list of package images
 */
export const getPackageImages = async (
  packageId: string
): Promise<PackageImageItem[]> => {
  const response = await axiosInstance.get(`/api/package/${packageId}/images/`);
  const resData = response.data;
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData?.results)) return resData.results;
  if (Array.isArray(resData?.data)) return resData.data;
  return [];
};


/**
 * Deletes a package image by its ID.
 */
export const deletePackageImage = async (packageId: string, imageId: string): Promise<void> => {
  await axiosInstance.delete(`/api/package/${packageId}/images/${imageId}/`);
};
/**
 * 9. PATCH /api/package/images/{image_id}/
 * Set primary flag on package image
 */
export const setPrimaryPackageImage = async (
  imageId: string
): Promise<PackageImageItem> => {
  const response = await axiosInstance.patch(
    `/api/package/images/${imageId}/`,
    { is_primary: true }
  );
  return response.data?.data || response.data;
};
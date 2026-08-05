import axiosInstance from "@/api/axios";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type ReportReason =
  | "SCAM"
  | "HARASSMENT"
  | "FAKE_IDENTITY"
  | "OFF_PLATFORM_PAYMENT"
  | "DAMAGE"
  | "DELAY"
  | "OTHER";

export type ReportStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "REJECTED"
  | "ESCALATED";

export type ReportActionTaken =
  | "NONE"
  | "WARNING"
  | "SUSPEND"
  | "PERMANENT_BAN";

export interface EvidenceFile {
  id: string;
  file: string;
}

export interface CreateReportPayload {
  reported_user: string;
  booking: string;
  reason: ReportReason;
  description: string;
  evidence_files?: File[];
}

export interface CreateReportResponseData {
  id: string;
  status: ReportStatus;
  reason: ReportReason;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface MyReportListItem {
  id: string;
  booking: string;
  reason: ReportReason;
  status: ReportStatus;
  action_taken: ReportActionTaken;
  created_at: string;
}

export interface MyReportsResponse {
  success: boolean;
  count: number;
  results: MyReportListItem[];
}

export interface ReportDetailData {
  id: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  action_taken: ReportActionTaken;
  evidence_files: EvidenceFile[];
}

export interface AdminResolvePayload {
  status: "RESOLVED" | "REJECTED" | "ESCALATED";
  is_valid?: boolean;
  action_taken?: ReportActionTaken;
  admin_notes?: string;
  trust_score_deduction?: number;
  suspension_days?: number;
  ban_reason?: string;
}

// ==========================================
// API METHODS
// ==========================================

/**
 * 1. Create Report (Multipart Form Data)
 */
export const createReport = async (
  payload: CreateReportPayload
): Promise<ApiResponse<CreateReportResponseData>> => {
  const formData = new FormData();
  formData.append("reported_user", payload.reported_user);
  formData.append("booking", payload.booking);
  formData.append("reason", payload.reason);
  formData.append("description", payload.description);

  if (payload.evidence_files && payload.evidence_files.length > 0) {
    payload.evidence_files.forEach((file) => {
      formData.append("evidence_files", file);
    });
  }

  const response = await axiosInstance.post<ApiResponse<CreateReportResponseData>>(
    "/api/reports/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * 2. Get My Reports
 */
export const getMyReports = async (): Promise<MyReportsResponse> => {
  const response = await axiosInstance.get<MyReportsResponse>("/api/reports/");
  return response.data;
};

/**
 * 3. Report Detail
 */
export const getReportDetail = async (
  reportId: string
): Promise<ApiResponse<ReportDetailData>> => {
  const response = await axiosInstance.get<ApiResponse<ReportDetailData>>(
    `/api/reports/${reportId}/`
  );
  return response.data;
};

/**
 * 4. Admin Report List
 */
export const getAdminReports = async (): Promise<MyReportsResponse> => {
  const response = await axiosInstance.get<MyReportsResponse>("/api/admin/reports/");
  return response.data;
};

/**
 * 5. Admin Report Detail
 */
export const getAdminReportDetail = async (
  reportId: string
): Promise<ApiResponse<ReportDetailData>> => {
  const response = await axiosInstance.get<ApiResponse<ReportDetailData>>(
    `/api/admin/reports/${reportId}/`
  );
  return response.data;
};

/**
 * 6. Admin Resolve Report
 */
export const adminResolveReport = async (
  reportId: string,
  payload: AdminResolvePayload
): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.patch<ApiResponse<any>>(
    `/api/admin/reports/${reportId}/resolve/`,
    payload
  );
  return response.data;
};
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Globe,
  Loader2,
  Star,
  UserPlus,
  X,
} from "lucide-react";
import {
  getAdminPackageReviewDetailApi,
  reviewAdminPackageApi,
  PackageReviewDetail,
} from "@/api/packages.api";

interface PackageReviewModalProps {
  packageId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PackageReviewModal: React.FC<PackageReviewModalProps> = ({
  packageId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PackageReviewDetail | null>(null);

  useEffect(() => {
    if (isOpen && packageId) {
      fetchReviewData(packageId);
    } else {
      setData(null);
      setError(null);
      setActionType(null);
    }
  }, [isOpen, packageId]);

  const fetchReviewData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminPackageReviewDetailApi(id);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || "Failed to fetch review details.");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "An error occurred while fetching details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (approve: boolean) => {
    if (!packageId || submitting || isAlreadyReviewed) return;
    try {
      setSubmitting(true);
      setActionType(approve ? "approve" : "reject");

      await reviewAdminPackageApi(packageId, approve);
      
      if (data) {
        setData({
          ...data,
          verification: {
            ...data.verification,
            status: approve ? "APPROVED" : "REJECTED",
          },
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to process review action.");
    } finally {
      setSubmitting(false);
      setActionType(null);
    }
  };

  if (!isOpen) return null;

  const currentStatus = data?.verification?.status?.toUpperCase();
  const isAlreadyReviewed = currentStatus === "APPROVED" || currentStatus === "REJECTED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Dialog Container */}
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 my-auto relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Packages
          </button>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                currentStatus === "APPROVED" || currentStatus === "VERIFIED"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : currentStatus === "REJECTED"
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : "bg-amber-100 text-amber-800 border-amber-200"
              }`}
            >
              {data?.verification?.status || "PENDING"}
              <Check className="w-3 h-3 ml-1 stroke-[3]" />
            </span>

            {/* Cross / Close Button */}
            <button
              onClick={onClose}
              type="button"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Fetching package details...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium text-center">
              {error}
            </div>
          </div>
        ) : data ? (
          <div className="divide-y divide-slate-100 max-h-[75vh] overflow-y-auto">
            
            {/* Package Image Section */}
            <div className="p-6 text-center">
              <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
                Package Image
              </h3>

              {data.images && data.images.length > 0 ? (
                <div className="relative w-full h-52 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={data.images[0].image}
                    alt={data.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="relative w-full h-48 bg-slate-100 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  <span className="text-sm font-medium text-slate-400">
                    PACKAGE IMAGE
                  </span>
                </div>
              )}

              <div className="mt-3 inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" />
                Primary
              </div>
            </div>

            {/* Package Details Section */}
            <div className="p-6">
              <div className="flex justify-between items-start gap-4">
                <h2 className="text-lg font-bold text-slate-900">
                  {data.title}
                </h2>
                <div className="text-right whitespace-nowrap">
                  <span className="inline-block px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded mb-1 uppercase">
                    {data.category}
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {Number(data.weight).toFixed(2)} KG
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {data.description}
              </p>
            </div>

            {/* Delivery Route Section */}
            <div className="p-6 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
                Delivery Route
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900">
                    {data.pickup.country}, {data.pickup.city}
                  </p>
                  <p className="text-xs text-slate-500">
                    Pickup:{" "}
                    <span className="font-medium text-slate-700">
                      {data.pickup.date}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-slate-900">
                    {data.destination.country}, {data.destination.city}
                  </p>
                  <p className="text-xs text-slate-500">
                    Delivery:{" "}
                    <span className="font-medium text-slate-700">
                      {data.destination.latest_delivery_date}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Sender & Risk Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* Sender Info */}
              <div className="p-6 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  Sender
                </h3>
                <div>
                  <p className="font-bold text-slate-900">{data.sender.name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {data.sender.email}
                  </p>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-slate-600 font-medium">
                    Completed Deliveries:{" "}
                    <span className="font-bold text-slate-900">
                      {data.sender.completed_deliveries}
                    </span>
                  </p>
                  {data.sender.completed_deliveries === 0 && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60 rounded">
                      NEW SENDER
                    </span>
                  )}
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="p-6 space-y-3 bg-slate-50/30">
                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                  Risk Assessment
                </h3>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-emerald-600">
                    {data.verification.risk_score}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                    {data.verification.risk_score < 30 ? "Low Risk" : "High Risk"}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  {data.risk_factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-slate-600"
                    >
                      <span className="flex items-center gap-1.5">
                        {factor.reason.toLowerCase().includes("user") ? (
                          <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        {factor.reason}
                      </span>
                      <span className="font-semibold text-slate-700">
                        +{factor.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Verification Status List */}
            <div className="p-6 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
                Verification
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Verification Status</span>
                  <span className="flex items-center text-emerald-600 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 mr-1" />{" "}
                    {data.verification.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Legal Declaration</span>
                  <span className="flex items-center text-emerald-600 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Accepted
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Terms Accepted</span>
                  <span className="flex items-center text-emerald-600 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Accepted
                  </span>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 bg-slate-50/80 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                disabled={submitting || loading || isAlreadyReviewed}
                onClick={() => handleAction(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-sm transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                {submitting && actionType === "reject" ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                )}
                {currentStatus === "REJECTED" ? "Rejected" : "Reject Package"}
              </button>

              <button
                type="button"
                disabled={submitting || loading || isAlreadyReviewed}
                onClick={() => handleAction(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
              >
                {submitting && actionType === "approve" ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                )}
                {currentStatus === "APPROVED" ? "Package Approved" : "Approve Package"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
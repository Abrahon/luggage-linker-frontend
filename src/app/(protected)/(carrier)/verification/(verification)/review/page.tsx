"use client";

import { useVerification } from "@/app/(protected)/(carrier)/verification/(verification)/VerificationLayOut";
import { CheckCircle2, Clock, AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ReviewPage() {
  const { existingKyc, setIdData, setSelfieBase64 } = useVerification();
  const router = useRouter();

  if (!existingKyc) {
    return <p className="text-center text-sm text-gray-500">No submission found.</p>;
  }

  const handleReSubmit = () => {
    // Convert null fields from API response to undefined
    setIdData({
      idType: existingKyc.id_type as any,
      idNumber: existingKyc.id_number,
      front: undefined,
      back: undefined,
      frontPreviewUrl: existingKyc.document_front ?? undefined,
      backPreviewUrl: existingKyc.document_back ?? undefined,
    });

    setSelfieBase64(existingKyc.selfie ?? null);

    router.push("/verification/idverification");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Approved State - Locked */}
      {existingKyc.status === "approved" && (
        <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-xl border border-green-200">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-bold text-sm">KYC Approved</p>
            <p className="text-xs">
              Verified on {new Date(existingKyc.verified_at || "").toLocaleDateString()}. Documents are locked.
            </p>
          </div>
        </div>
      )}

      {/* Rejected State - Actionable Re-submit */}
      {existingKyc.status === "rejected" && (
        <div className="flex flex-col gap-3 bg-red-50 p-4 rounded-xl border border-red-200 text-red-700">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Verification Failed</p>
              <p className="text-xs mt-1">
                Reason: {existingKyc.rejection_reason || "Document details were unclear."}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleReSubmit}
            className="self-end bg-red-600 hover:bg-red-700 text-white text-xs gap-2 mt-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Update & Resubmit
          </Button>
        </div>
      )}

      {/* Pending State - Optional Edit Request */}
      {existingKyc.status === "pending" && (
        <div className="flex items-center justify-between bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">Under Review</p>
              <p className="text-xs">Need to change an uploaded photo before approval?</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleReSubmit}
            variant="outline"
            className="border-amber-300 text-amber-800 hover:bg-amber-100 text-xs cursor-pointer"
          >
            Edit Uploads
          </Button>
        </div>
      )}

      {/* Submitted Images Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
        <div>
          <span className="text-gray-500 text-xs block">Document Type</span>
          <span className="font-semibold capitalize">{existingKyc.id_type?.replace("_", " ")}</span>
        </div>
        <div>
          <span className="text-gray-500 text-xs block">ID Number</span>
          <span className="font-semibold">{existingKyc.id_number}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {existingKyc.document_front && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium">Front Document</span>
            <div className="relative w-36 h-24 border rounded-lg overflow-hidden bg-white">
              <Image src={existingKyc.document_front} alt="Front ID" fill className="object-cover" />
            </div>
          </div>
        )}
        {existingKyc.document_back && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium">Back Document</span>
            <div className="relative w-36 h-24 border rounded-lg overflow-hidden bg-white">
              <Image src={existingKyc.document_back} alt="Back ID" fill className="object-cover" />
            </div>
          </div>
        )}
        {existingKyc.selfie && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-medium">Selfie Photo</span>
            <div className="relative w-24 h-24 border rounded-lg overflow-hidden bg-white">
              <Image src={existingKyc.selfie} alt="Selfie" fill className="object-cover" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
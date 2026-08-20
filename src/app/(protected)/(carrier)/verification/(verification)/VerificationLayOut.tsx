"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IdCard, Camera, CheckCircle, Info, Loader2, AlertTriangle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, dataURLtoFile } from "@/lib/utils";
import { submitKYCApi, getMyKYCApi, KYCData } from "@/api/kyc.api";
import { toast } from "sonner";

export interface IDFormData {
  idType: "national_id" | "passport" | "driving_license";
  idNumber: string;
  front?: File;
  back?: File;
}

interface VerificationContextType {
  isStepComplete: boolean;
  setStepComplete: (complete: boolean) => void;
  idData: IDFormData;
  setIdData: React.Dispatch<React.SetStateAction<IDFormData>>;
  selfieBase64: string | null;
  setSelfieBase64: (base64: string) => void;
  existingKyc: KYCData | null;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const useVerification = () => {
  const ctx = useContext(VerificationContext);
  if (!ctx) throw new Error("useVerification must be used within VerificationLayout");
  return ctx;
};

const steps = [
  { key: "idverification", label: "ID Verification", icon: IdCard },
  { key: "selfie", label: "Selfie", icon: Camera },
  { key: "review", label: "Status Review", icon: CheckCircle },
];

export default function VerificationLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [existingKyc, setExistingKyc] = useState<KYCData | null>(null);

  const [isStepComplete, setStepComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [idData, setIdData] = useState<IDFormData>({
    idType: "national_id",
    idNumber: "",
  });
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);

  useEffect(() => {
    getMyKYCApi()
      .then((data) => {
        if (data) {
          setExistingKyc(data);
          if (pathname !== "/verification/review") {
            router.push("/verification/review");
          }
        }
      })
      .catch(() => toast.error("Failed to fetch existing KYC state."))
      .finally(() => setLoadingInitial(false));
  }, [pathname, router]);

  const activeStepIndex = steps.findIndex((s) => pathname.includes(s.key));
  const currentStep = activeStepIndex === -1 ? 0 : activeStepIndex;

  const handleSubmit = async () => {
    if (!idData.front) {
      toast.error("Front ID document is required.");
      return;
    }
    if (idData.idType !== "passport" && !idData.back) {
      toast.error("Back ID document is required for this document type.");
      return;
    }
    if (!selfieBase64) {
      toast.error("Selfie image is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const selfieFile = dataURLtoFile(selfieBase64, "selfie.png");

      const response = await submitKYCApi({
        id_type: idData.idType,
        id_number: idData.idNumber,
        document_front: idData.front,
        document_back: idData.back,
        selfie: selfieFile,
      });

      toast.success("KYC submitted successfully!");
      setExistingKyc(response);
      router.push("/verification/review");
    } catch (error: any) {
      const responseErrors = error?.response?.data;
      if (typeof responseErrors === "object" && responseErrors !== null) {
        const firstKey = Object.keys(responseErrors)[0];
        const errorVal = responseErrors[firstKey];
        toast.error(Array.isArray(errorVal) ? errorVal[0] : errorVal);
      } else {
        toast.error("Failed to submit verification details.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!isStepComplete || isSubmitting) return;

    if (steps[currentStep]?.key === "selfie") {
      await handleSubmit();
      return;
    }

    if (currentStep < steps.length - 1) {
      setStepComplete(false);
      router.push(`/verification/${steps[currentStep + 1].key}`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0 && !isSubmitting) {
      router.push(`/verification/${steps[currentStep - 1].key}`);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <VerificationContext.Provider
      value={{
        isStepComplete,
        setStepComplete,
        idData,
        setIdData,
        selfieBase64,
        setSelfieBase64,
        existingKyc,
      }}
    >
      <div className="flex flex-col py-8 px-4 max-w-4xl mx-auto gap-6">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between w-full relative">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const done = i < currentStep || !!existingKyc;
            const active = i === currentStep;

            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative z-10">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white transition-all",
                    done ? "bg-green-600" : active ? "bg-blue-600" : "bg-gray-300"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold mt-2 text-gray-700">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {children}

          {!existingKyc && pathname !== "/verification/review" && (
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
              <Button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0 || isSubmitting}
                variant="outline"
              >
                Previous
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                disabled={!isStepComplete || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : steps[currentStep]?.key === "selfie" ? (
                  "Submit KYC"
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </VerificationContext.Provider>
  );
}
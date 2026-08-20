"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";
import { User, IdCard, Camera, Home, CheckCircle, Info, Loader2 } from "lucide-react";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { Button } from "@/components/ui/button";
import { cn, dataURLtoFile } from "@/lib/utils";
import { submitKYCApi } from "@/api/kyc.api";
 
import { IDVerificationData } from "@/webcomponent/carrier";

// ------------------- Verification Context -------------------
interface VerificationContextType {
  isStepComplete: boolean;
  setStepComplete: (complete: boolean) => void;
  // State setters for collecting step data
  setIdData: (data: IDVerificationData) => void;
  setSelfieBase64: (base64: string) => void;
  idData: IDVerificationData | null;
  selfieBase64: string | null;
}

const VerificationContext = createContext<VerificationContextType | undefined>(
  undefined
);

// ------------------- Hook -------------------
export const useVerification = () => {
  const ctx = useContext(VerificationContext);
  if (!ctx)
    throw new Error("useVerification must be used within VerificationLayOut");
  return ctx;
};

// ------------------- Steps -------------------
const steps = [
  { key: "personal", label: "Personal", icon: User },
  { key: "idverification", label: "ID Verification", icon: IdCard },
  { key: "selfie", label: "Selfie", icon: Camera },
  { key: "address", label: "Address", icon: Home },
  { key: "review", label: "Review", icon: CheckCircle },
];

export default function VerificationLayOut({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Completed steps persistence
  const [completed, setCompleted] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("verifiedSteps") || "[]");
    }
    return [];
  });

  // Step completion state controlled by children
  const [isStepComplete, setStepComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collected data from multi-step form
  const [idData, setIdData] = useState<IDVerificationData | null>(null);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);

  const currentStep = steps.findIndex((s) => pathname.includes(s.key));

  useEffect(() => {
    localStorage.setItem("verifiedSteps", JSON.stringify(completed));
  }, [completed]);

  // Handle Django backend API submission
  const handleFinalSubmission = async () => {
    if (!idData || !idData.front || !selfieBase64) {
      alert("Missing required documents. Please make sure ID and Selfie are uploaded.");
      return false;
    }

    try {
      setIsSubmitting(true);

      // Convert webcam base64 data string to binary File
      const selfieFile = dataURLtoFile(selfieBase64, "selfie.png");

      await submitKYCApi({
        id_type: idData.idType,
        id_number: idData.idNumber,
        document_front: idData.front,
        document_back: idData.back,
        selfie: selfieFile,
      });

      return true;
    } catch (error: any) {
      console.error("KYC Submission Error:", error);
      const errorMsg =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to submit verification data. Please try again.";
      alert(errorMsg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };


// Navigate next
  const handleNext = async () => {
    if (!isStepComplete || isSubmitting) return;

    const currentStepKey = steps[currentStep]?.key;

    // Trigger API call when submitting after the selfie step
    if (currentStepKey === "selfie") {
      const success = await handleFinalSubmission();
      if (!success) return; // Halt navigation if API submission fails
    }

    if (currentStep < steps.length - 1) {
      const next = steps[currentStep + 1].key;
      setCompleted((prev) => [...new Set([...prev, steps[currentStep].key])]);
      setStepComplete(false); // Reset completion status for next step
      router.push(`/verification/${next}`);
    }
  };

  // Navigate previous
  const handlePrevious = () => {
    if (currentStep > 0 && !isSubmitting) {
      const prev = steps[currentStep - 1].key;
      router.push(`/verification/${prev}`);
    }
  };

  // --------- Conditional Heading & Subheading ---------
  let heading: React.ReactNode = "";
  let subheading: React.ReactNode = "";

  switch (steps[currentStep]?.key) {
    case "personal":
      heading = "Personal Details";
      subheading =
        "Make sure the information matches your government ID exactly.";
      break;
    case "idverification":
      heading = "Government ID Verification";
      subheading = "Upload a clear photo of your government-issued ID";
      break;
    case "selfie":
      heading = "Take a Quick Selfie";
      subheading =
        "Make sure you’re in good lighting. Remove hats or sunglasses.";
      break;
    case "address":
      heading = "Verify Your Current Address";
      subheading =
        "Upload a recent utility bill or document showing your name & address.";
      break;
    default:
      heading = "Verification";
      subheading = "";
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
      }}
    >
      <div className="flex flex-col py-8 px-4 gap-4 sm:gap-8">
        {/* -------- Heading Section -------- */}
        <HeadingSection heading={heading} subheading={subheading} />

        {/* -------- Progress Steps -------- */}
        <div className="flex flex-wrap sm:flex-nowrap items-start justify-between w-full mb-6 relative gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const done = completed.includes(step.key) || i < currentStep;
            const active = i === currentStep;

            return (
              <div
                key={step.key}
                className="flex-1 flex flex-col items-center justify-center relative min-w-[50px]"
              >
                {/* Circle + Icon */}
                <div
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 text-white z-10",
                    done
                      ? "bg-[#00A63E]"
                      : active
                      ? "bg-blue-500"
                      : "bg-[#C0C0C0]"
                  )}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Label */}
                <span className="text-xs sm:text-sm mt-1 text-gray-700 font-medium text-center">
                  {step.label}
                </span>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-5 sm:top-6 left-[calc(50%+20px)] w-full h-[3px] transition-all duration-500",
                      done ? "bg-green-500" : "bg-[#C0C0C0]"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-[#EFF6FF] border border-[#155DFC] self-center flex items-center gap-2 px-4 py-2 rounded-lg mb-6">
          <Info className="w-5 h-5 text-[#155DFC] shrink-0" />
          <span>
            {pathname !== "/verification/review"
              ? "This information will be used to verify your identity & must match your official documents."
              : "Your submitted documents are currently under review. Our admin team is checking the details and will update you within 2–3 working days. Thank you for your patience and cooperation."}
          </span>
        </div>

        {/* -------- Step Content -------- */}
        {pathname !== "/verification/review" && (
          <div className="w-full md:max-w-[45vw] mx-auto bg-white rounded-2xl shadow p-6 flex flex-col justify-between">
            {children}

            {/* -------- Navigation Buttons -------- */}
            <div className="flex flex-col sm:flex-row justify-center gap-2 mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0 || isSubmitting}
                variant="outline_black"
                className={`${
                  currentStep === 0 || isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                }`}
              >
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={!isStepComplete || isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </span>
                  ) : (
                    "Next"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isStepComplete || isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </span>
                  ) : (
                    "Finish"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </VerificationContext.Provider>
  );
}
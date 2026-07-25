"use client";

import { useEffect, useState } from "react";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { CheckCircle, CheckCircle2, Shield, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getMyKYCApi, KYCData } from "@/api/kyc.api";

export const Verification = () => {
  const router = useRouter();
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyKYCApi()
      .then((data) => setKycData(data))
      .catch((err) => console.error("Failed to load KYC status:", err))
      .finally(() => setLoading(false));
  }, []);

  const verificationData = [
    {
      id: 1,
      title: "Accept Requests",
      description: "Start earning by carrying packages",
      bgColor: "#EFF6FF",
      iconbg: "#3372FC33",
      icontext: "#3372FC",
      icon: <CheckCircle2 size={36} />,
    },
    {
      id: 2,
      title: "Build Trust",
      description: "Verified badge increases bookings",
      bgColor: "#F0FDF4",
      iconbg: "#119F6833",
      icontext: "#119F68",
      icon: <Shield size={36} />,
    },
    {
      id: 3,
      title: "Higher Payouts",
      description: "Access premium delivery opportunities",
      bgColor: "#FAF5FF",
      iconbg: "#9C1AFA33",
      icontext: "#9C1AFA",
      icon: <CheckCircle size={36} />,
    },
  ];

  const renderStatusBadge = () => {
    if (loading) return <span className="text-gray-500 text-sm">Checking status...</span>;

    const status = kycData?.status || "unverified";

    switch (status) {
      case "approved":
        return (
          <span className="flex items-center gap-2 rounded-lg bg-emerald-100 text-emerald-800 px-4 py-2 text-sm font-semibold w-fit border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Verified Profile
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-2 rounded-lg bg-amber-100 text-amber-800 px-4 py-2 text-sm font-semibold w-fit border border-amber-300">
            <Clock className="w-4 h-4 text-amber-600" />
            Pending Approval
          </span>
        );
      case "rejected":
        return (
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2 rounded-lg bg-rose-100 text-rose-800 px-4 py-2 text-sm font-semibold w-fit border border-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Verification Rejected
            </span>
            {kycData?.rejection_reason && (
              <p className="text-sm text-rose-600 font-medium">
                Reason: {kycData.rejection_reason}
              </p>
            )}
          </div>
        );
      default:
        return (
          <span className="rounded-lg bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium w-fit">
            Unverified
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-10 py-16 md:px-6 px-4">
      <HeadingSection
        heading="Identity Verification"
        subheading="Complete verification to accept shipments & get higher payouts."
      />

      {renderStatusBadge()}

      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 w-full">
        {verificationData.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center justify-center text-center gap-3 rounded-xl border p-8 transition-transform duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: item.bgColor,
              borderColor: "#D4D4D466",
            }}
          >
            <div
              className="flex items-center justify-center w-16 h-16 rounded-full"
              style={{
                backgroundColor: item.iconbg,
                color: item.icontext,
              }}
            >
              {item.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
          </div>
        ))}
      </div>

      {kycData?.status !== "approved" && (
        <Button
          className="mt-4 w-fit self-center"
          size="lg"
          onClick={() => router.push("/verification/personal")}
          disabled={kycData?.status === "pending"}
        >
          {kycData?.status === "rejected"
            ? "Re-submit Verification"
            : kycData?.status === "pending"
            ? "Under Review"
            : "Start Verification"}
        </Button>
      )}
    </div>
  );
};
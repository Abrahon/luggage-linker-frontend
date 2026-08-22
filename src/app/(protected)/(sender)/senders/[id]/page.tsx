"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2,
  MessageSquare,
  ArrowLeft,
  Loader2,
  PackageCheck,
  PackageX,
  Package,
  TrendingUp,
  MapPin,
  AlertCircle,
  X,
  Mail,
  Phone,
  Calendar,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSenderProfileApi } from "@/api/profile.api";
import { contactTraveler } from "@/api/chat.api";
import { SenderProfileData } from "@/types/profile";

export default function SenderProfilePage({
  params: paramsProp,
}: {
  params?: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const rawParams = useParams();

  // Safely extract parameter across Next.js versions
  const unwrappedParams =
    paramsProp && typeof (paramsProp as any).then === "function"
      ? React.use(paramsProp as Promise<{ id: string }>)
      : (paramsProp as { id: string });

  const senderId = (unwrappedParams?.id || rawParams?.id) as string;

  const [profile, setProfile] = useState<SenderProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [contacting, setContacting] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!senderId) return;

    // Console log to debug the extracted sender ID
    console.log("Current senderId parameter from URL:", senderId);

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getSenderProfileApi(senderId);

        // Standardize response payload (Handles { success, message, data: { ... } } structure)
        const profileData =
          (response as any)?.data?.data || (response as any)?.data || response;

        if (
          profileData &&
          (profileData.name || profileData.email || profileData.id)
        ) {
          setProfile(profileData as SenderProfileData);
        } else if ((response as any)?.success === false) {
          setError((response as any)?.message || "Failed to load sender profile.");
        } else {
          setProfile(profileData as SenderProfileData);
        }
      } catch (err: any) {
        console.error("Error fetching sender profile:", err);
        const errMsg =
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          "Unable to load sender profile. Please try again.";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [senderId]);

  const handleContactSender = async () => {
    if (!senderId) return;

    try {
      setContacting(true);
      setNotice(null);

      const response = await contactTraveler(senderId);

      if (response?.success && response?.data?.room_id) {
        router.push(`/messages?room=${response.data.room_id}`);
        return;
      }

      setNotice(response?.message || "Unable to open chat session.");
    } catch (err: any) {
      console.error("Failed to initiate chat session:", err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to initiate chat with sender.";
      setNotice(backendMessage);
    } finally {
      setContacting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[600px] flex flex-col items-center justify-center gap-3 bg-white font-montserrat">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm font-bold text-slate-500">Loading sender profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full min-h-[500px] bg-white flex flex-col items-center justify-center p-6 font-montserrat">
        <div className="max-w-md w-full text-center border border-slate-200/80 rounded-3xl p-8 bg-slate-50/50 shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-black text-slate-900 mb-1">
            Profile Unavailable
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {error || "We couldn't find the requested sender profile."}
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white font-montserrat text-slate-900 py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div>
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-slate-900 font-extrabold -ml-3 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        {/* Notice Banner */}
        {notice && (
          <div className="w-full bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs sm:text-sm font-bold leading-tight">{notice}</p>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-amber-500 hover:text-amber-800 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Profile Card Header */}
        <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start gap-6 w-full md:w-auto">
              {/* Profile Image */}
              <div className="relative shrink-0">
                <div className="p-1 rounded-full bg-gradient-to-tr from-amber-400 via-amber-200 to-slate-200 shadow-sm">
                  {profile.profile_image ? (
                    <Image
                      src={profile.profile_image}
                      alt={profile.name || "Sender Profile"}
                      width={120}
                      height={120}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black text-4xl flex items-center justify-center border-2 border-white shadow-xs">
                      {profile.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                  )}
                </div>

                {profile.is_email_verified && (
                  <div
                    className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md border border-emerald-100"
                    title="Verified Email Sender"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500 stroke-white stroke-[2.5]" />
                  </div>
                )}
              </div>

              {/* Profile Main Details */}
              <div className="space-y-3 flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {profile.name || "Sender Profile"}
                  </h1>
                  {profile.is_email_verified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-200/80">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                      Verified Sender
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200/80">
                      <XCircle className="w-3.5 h-3.5 text-amber-600" />
                      Unverified Email
                    </span>
                  )}
                </div>

                {/* Country Location */}
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{profile.country || "Worldwide"}</span>
                </div>

                {/* Contact and Join Details */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-bold text-slate-600">
                  {profile.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Member since {formatDate(profile.member_since)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0">
              <Button
                onClick={handleContactSender}
                disabled={contacting}
                className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black px-8 py-6 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-base disabled:opacity-70 cursor-pointer"
              >
                {contacting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Starting Chat...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" /> Contact Sender
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Total Packages
              </span>
              <Package className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {profile.total_packages || 0}
              </div>
              <span className="text-[11px] font-bold text-slate-400 block mt-1">
                Packages created
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Successful
              </span>
              <PackageCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">
                {profile.successful_deliveries || 0}
              </div>
              <span className="text-[11px] font-bold text-slate-400 block mt-1">
                Completed deliveries
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Cancelled
              </span>
              <PackageX className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-rose-600">
                {profile.cancelled_deliveries || 0}
              </div>
              <span className="text-[11px] font-bold text-slate-400 block mt-1">
                Cancelled deliveries
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Success Rate
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">
                {Math.round(profile.success_rate || 0)}%
              </div>
              <span className="text-[11px] font-bold text-slate-400 block mt-1">
                Overall completion rate
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// app/(protected)/(carrier)/travelers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2,
  Star,
  MessageSquare,
  ArrowLeft,
  Loader2,
  PackageCheck,
  Plane,
  TrendingUp,
  MapPin,
  ShieldAlert,
  AlertCircle,
  Quote,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTravelerProfileApi } from "@/api/profile.api";
import { PublicTravelerProfile } from "@/types/profile";

export default function TravelerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const travelerId = params?.id as string;

  const [profile, setProfile] = useState<PublicTravelerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!travelerId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getTravelerProfileApi(travelerId);
        if (response.success && response.data) {
          setProfile(response.data);
        } else {
          setError(response.message || "Failed to load traveler profile.");
        }
      } catch (err) {
        console.error("Error fetching traveler profile:", err);
        setError("Unable to load traveler profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [travelerId]);

  if (loading) {
    return (
      <div className="w-full min-h-[600px] flex flex-col items-center justify-center gap-3 bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-sm font-bold text-slate-500">
          Loading traveler profile...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full min-h-[500px] bg-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center border border-slate-200/80 rounded-3xl p-8 bg-slate-50/50 shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-black text-slate-900 mb-1">
            Profile Unavailable
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {error || "We couldn't find the requested traveler profile."}
          </p>
          <Button
            onClick={() => router.back()}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getRatingPercentage = (starCount: number) => {
    if (!profile.total_reviews || profile.total_reviews === 0) return 0;
    const count =
      profile.rating_distribution?.[
        starCount.toString() as keyof typeof profile.rating_distribution
      ] || 0;
    return (count / profile.total_reviews) * 100;
  };

  const formatDate = (dateString: string) => {
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

  return (
    <div className="w-full min-h-screen bg-white font-montserrat text-slate-900 py-8 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div>
          <Button
            variant="ghost"
            className="text-slate-600 hover:text-slate-900 font-extrabold -ml-3 hover:bg-slate-100 rounded-xl transition-all"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        {/* Main Header Profile Card */}
        <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          {/* Accent Background Gradient Flare */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            
            {/* Top Left Profile Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row items-start gap-6 w-full md:w-auto">
              
              {/* Fully Rounded Profile Avatar Container */}
              <div className="relative shrink-0">
                <div className="p-1 rounded-full bg-gradient-to-tr from-amber-400 via-amber-200 to-slate-200 shadow-sm">
                  {profile.profile_image ? (
                    <Image
                      src={profile.profile_image}
                      alt={profile.name}
                      width={120}
                      height={120}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                  ) : (
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-black text-4xl flex items-center justify-center border-2 border-white shadow-xs">
                      {profile.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Verified Badge */}
                <div
                  className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md border border-emerald-100"
                  title="Verified Traveler"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500 stroke-white stroke-[2.5]" />
                </div>
              </div>

              {/* Traveler Information Stack */}
              <div className="space-y-3 flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-600 border border-emerald-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                    Verified
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{profile.country || "Global Traveler"}</span>
                </div>

                {/* Dynamic About Section directly under location */}
                {profile.about && (
                  <div className="pt-2 border-t border-slate-100 max-w-2xl">
                    <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 flex items-start gap-3">
                      <Quote className="w-4 h-4 text-amber-500 shrink-0 rotate-180 mt-0.5" />
                      <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed italic">
                        &quot;{profile.about}&quot;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Contact Button */}
            <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0">
              <Button className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black px-8 py-6 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-base">
                <MessageSquare className="w-5 h-5" /> Contact Traveler
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider">Rating</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 flex items-center gap-1">
                {Number(profile.average_rating || 0).toFixed(1)}
                <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 block mt-1">
                From {profile.total_reviews} reviews
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider">Deliveries</span>
              <PackageCheck className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {profile.total_deliveries || 0}
              </div>
              <span className="text-[11px] font-bold text-emerald-600 block mt-1">
                {profile.successful_deliveries || 0} successful
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider">Trips</span>
              <Plane className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {profile.completed_trips || 0}
              </div>
              <span className="text-[11px] font-bold text-slate-400 block mt-1">
                Completed itineraries
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider">Success Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">
                {Math.round(profile.success_rate || 0)}%
              </div>
              <span className="text-[11px] font-bold text-slate-400 block mt-1">
                Verified delivery rate
              </span>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider">Disputes</span>
              <ShieldAlert className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800">
                {profile.disputed_deliveries || 0}
              </div>
              <span className="text-[11px] font-bold text-slate-400 block mt-1">
                {profile.traveler_fault_disputes || 0} fault record
              </span>
            </div>
          </div>

        </div>

        {/* Content Layout: Ratings Breakdown & Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Rating Summary Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">
                Rating Overview
              </h3>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>

            <div className="flex items-center gap-4 bg-amber-50/60 border border-amber-100 p-4 rounded-2xl">
              <div className="text-4xl font-black text-slate-900">
                {Number(profile.average_rating || 0).toFixed(1)}
              </div>
              <div>
                <div className="flex text-amber-400 gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-500">
                  Based on {profile.total_reviews} verified reviews
                </p>
              </div>
            </div>

            {/* Distribution Bars */}
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count =
                  profile.rating_distribution?.[
                    stars.toString() as keyof typeof profile.rating_distribution
                  ] || 0;
                const percentage = getRatingPercentage(stars);

                return (
                  <div key={stars} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <span className="w-6 flex items-center gap-1">
                      {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-slate-400 font-extrabold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Reviews Timeline */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                Recent Reviews ({profile.recent_reviews?.length || 0})
              </h3>
            </div>

            {!profile.recent_reviews || profile.recent_reviews.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-400">
                  No public reviews recorded yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.recent_reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-5 border border-slate-100 rounded-2xl bg-slate-50/40 hover:bg-slate-50/80 transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {review.reviewer_profile_image ? (
                          <Image
                            src={review.reviewer_profile_image}
                            alt={review.reviewer}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover border border-white shadow-2xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center">
                            {review.reviewer?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {review.reviewer}
                          </h4>
                          <span className="text-[11px] font-medium text-slate-400 block">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex text-amber-400 gap-0.5 bg-white px-2.5 py-1 rounded-full border border-slate-200/60 shadow-2xs">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm font-medium text-slate-700 leading-relaxed pt-1">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
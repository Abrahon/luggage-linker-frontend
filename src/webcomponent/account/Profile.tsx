"use client";

import {
  Camera,
  Loader2,
  Edit3,
  X,
  Save,
  CheckCircle2,
  MapPin,
  User as UserIcon,
  Mail,
} from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { stringToColor } from "@/lib/stringToColor";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfile } from "@/hooks/useProfile";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(5, "Invalid phone number").optional().or(z.literal("")),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  bio: z
    .string()
    .max(500, "Bio cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export const Profile = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get("role") ?? "";

  const { profile, isLoading, error, updateProfile } = useProfile();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (profilePhoto) return URL.createObjectURL(profilePhoto);
    return null;
  }, [profilePhoto]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const populateFields = () => {
    if (profile) {
      reset({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        country: profile.country || "",
        city: profile.city || "",
        address: profile.address || "",
        postalCode: profile.postal_code || "",
        dateOfBirth: profile.date_of_birth || "",
        bio: profile.bio || "",
      });

      if (!profile.country || !profile.city || !profile.first_name) {
        setIsEditing(true);
      }
    }
  };

  useEffect(() => {
    populateFields();
  }, [profile, reset]);

  const handleCancel = () => {
    setIsEditing(false);
    setProfilePhoto(null);
    setSubmitError(null);
    populateFields();
  };

  const onSubmit = async (data: ProfileForm) => {
    setSubmitError(null);
    setSuccessMsg(null);
    try {
      await updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        country: data.country,
        city: data.city,
        address: data.address,
        postal_code: data.postalCode,
        date_of_birth: data.dateOfBirth,
        bio: data.bio,
        profile_picture: profilePhoto,
      });

      setSuccessMsg("Profile onboarding complete!");
      setIsEditing(false);

      const userRole = (profile?.role || roleFromUrl || "").toLowerCase();

      setTimeout(() => {
        if (userRole === "traveler") {
          router.push("/verification");
        } else {
          router.push("/dashboard");
        }
      }, 1200);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to save profile details");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-xl my-10">
        <p className="font-medium">{error}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs"
        >
          Re-login to Continue
        </button>
      </div>
    );
  }

  const fallbackLetter = profile?.first_name ? profile.first_name[0] : "A";

  const getProfilePictureUrl = (
    url: string | null | undefined,
  ): string | null => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    return `${baseUrl}${url}`;
  };

  const resolvedPictureUrl = getProfilePictureUrl(profile?.profile_picture);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 relative" />

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 -mt-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-end gap-5">
              <div className="relative group">
                <label
                  htmlFor="profile-photo"
                  className={`flex justify-center items-center w-28 h-28 border-4 border-white rounded-full relative overflow-hidden shrink-0 shadow-md ${
                    isEditing ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover rounded-full"
                      unoptimized
                    />
                  ) : resolvedPictureUrl ? (
                    <Image
                      src={resolvedPictureUrl}
                      alt="Profile"
                      fill
                      className="object-cover rounded-full"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
                      style={{
                        backgroundColor: stringToColor(
                          profile?.first_name || "A",
                        ),
                      }}
                    >
                      {fallbackLetter.toUpperCase()}
                    </div>
                  )}

                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white w-7 h-7" />
                    </div>
                  )}
                </label>

                {isEditing && (
                  <input
                    type="file"
                    id="profile-photo"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                )}
              </div>

              <div className="mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.first_name} {profile?.last_name}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {profile?.email || "No email provided"}
                </p>
              </div>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold rounded-xl text-xs shadow-sm transition flex items-center gap-2 self-stretch sm:self-auto justify-center cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            )}
          </div>

          {submitError && (
            <div className="mt-6 p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {submitError}
            </div>
          )}

          {successMsg && (
            <div className="mt-6 p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-400" /> Personal Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="first-name"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    disabled={!isEditing}
                    {...register("firstName")}
                    placeholder="Enter first name"
                    className={`w-full text-xs p-3 rounded-xl border transition focus:outline-none ${
                      isEditing
                        ? "bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        : "bg-gray-50/70 border-gray-200 text-gray-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="last-name"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last-name"
                    disabled={!isEditing}
                    {...register("lastName")}
                    placeholder="Enter last name"
                    className={`w-full text-xs p-3 rounded-xl border transition focus:outline-none ${
                      isEditing
                        ? "bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        : "bg-gray-50/70 border-gray-200 text-gray-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Email Address{" "}
                    <span className="text-gray-400 font-normal">
                      (Non-editable)
                    </span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    disabled
                    {...register("email")}
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    disabled={!isEditing}
                    {...register("phone")}
                    placeholder="Enter phone number"
                    className={`w-full text-xs p-3 rounded-xl border transition focus:outline-none ${
                      isEditing
                        ? "bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        : "bg-gray-50/70 border-gray-200 text-gray-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="date-of-birth"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="date-of-birth"
                    disabled={!isEditing}
                    {...register("dateOfBirth")}
                    className={`w-full text-xs p-3 rounded-xl border transition focus:outline-none ${
                      isEditing
                        ? "bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        : "bg-gray-50/70 border-gray-200 text-gray-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Location Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label
                    htmlFor="country"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    disabled={!isEditing}
                    {...register("country")}
                    placeholder="Enter country"
                    className={`w-full text-xs p-3 rounded-xl border transition focus:outline-none ${
                      isEditing
                        ? "bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        : "bg-gray-50/70 border-gray-200 text-gray-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    disabled={!isEditing}
                    {...register("city")}
                    placeholder="Enter city"
                    className={`w-full text-xs p-3 rounded-xl border transition focus:outline-none ${
                      isEditing
                        ? "bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        : "bg-gray-50/70 border-gray-200 text-gray-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="postal-code"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postal-code"
                    disabled={!isEditing}
                    {...register("postalCode")}
                    placeholder="Postal code"
                    className={`w-full text-xs p-3 rounded-xl border transition focus:outline-none ${
                      isEditing
                        ? "bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        : "bg-gray-50/70 border-gray-200 text-gray-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label
                    htmlFor="address"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    disabled={!isEditing}
                    {...register("address")}
                    placeholder="Enter street address"
                    className={`w-full text-xs p-3 rounded-xl border transition focus:outline-none ${
                      isEditing
                        ? "bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                        : "bg-gray-50/70 border-gray-200 text-gray-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="bio"
                className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
              >
                About Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                disabled={!isEditing}
                {...register("bio")}
                placeholder="Tell us a little bit about yourself..."
                className={`w-full text-xs p-3 rounded-xl border transition focus:outline-none resize-none ${
                  isEditing
                    ? "bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    : "bg-gray-50/70 border-gray-200 text-gray-800 cursor-not-allowed"
                }`}
              />
              {errors.bio && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.bio.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-4">
            {isEditing && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Complete Onboarding
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

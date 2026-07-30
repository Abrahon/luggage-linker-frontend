"use client";

import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
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
  const { profile, isLoading, error, updateProfile } = useProfile();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  // Populate form values when backend data arrives
  useEffect(() => {
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
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setSubmitError(null);
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
      alert("Profile updated successfully!");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to update profile");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  const fallbackLetter = profile?.first_name ? profile.first_name[0] : "A";

  // Helper to resolve backend profile picture URL
  const getProfilePictureUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // Prefix relative backend paths with API base URL if applicable
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    return `${baseUrl}${url}`;
  };

  const resolvedPictureUrl = getProfilePictureUrl(profile?.profile_picture);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {submitError && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm">
            {submitError}
          </div>
        )}

        {/* Profile Photo */}
        <div className="flex items-center mb-6 gap-4">
          <label
            htmlFor="profile-photo"
            className="flex justify-center items-center w-24 h-24 border-2 rounded-full cursor-pointer relative overflow-hidden shrink-0"
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
                className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold"
                style={{
                  backgroundColor: stringToColor(profile?.first_name || "A"),
                }}
              >
                {fallbackLetter.toUpperCase()}
              </div>
            )}
            <div className="absolute bg-black/40 w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="text-white w-6 h-6" />
            </div>
          </label>
          <input
            type="file"
            id="profile-photo"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <div className="flex flex-col">
            <span className="text-lg font-semibold">Profile Photo</span>
            <span className="text-sm text-gray-500">
              Upload a new photo or change your existing one
            </span>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label htmlFor="first-name" className="block text-sm font-semibold text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              id="first-name"
              {...register("firstName")}
              placeholder="Enter your first name"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last-name" className="block text-sm font-semibold text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="last-name"
              {...register("lastName")}
              placeholder="Enter your last name"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              disabled
              placeholder="N/A"
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              {...register("phone")}
              placeholder="Enter your phone number"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="date-of-birth" className="block text-sm font-semibold text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              id="date-of-birth"
              {...register("dateOfBirth")}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              id="country"
              {...register("country")}
              placeholder="Enter your country"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              id="city"
              {...register("city")}
              placeholder="Enter your city"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postal-code" className="block text-sm font-semibold text-gray-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              id="postal-code"
              {...register("postalCode")}
              placeholder="Enter postal code"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.postalCode && (
              <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              id="address"
              {...register("address")}
              placeholder="Enter your street address"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              {...register("bio")}
              placeholder="Tell us a little bit about yourself..."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            {errors.bio && (
              <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
            )}
          </div>
        </div>

        {/* Footer info & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 gap-4">
          <span className="text-xs text-gray-400">
            Profile ID: {profile?.id}
          </span>
          <button
            type="submit"
            className="w-full sm:w-fit px-6 py-2 bg-primary rounded-lg text-white text-sm tracking-wider font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
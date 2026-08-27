// "use client";

// import {
//   Camera,
//   Loader2,
//   Edit3,
//   X,
//   Save,
//   CheckCircle2,
//   MapPin,
//   User as UserIcon,
//   Mail,
//   Sparkles,
// } from "lucide-react";
// import Image from "next/image";
// import { useState, useMemo, useEffect, Suspense } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { stringToColor } from "@/lib/stringToColor";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useProfile } from "@/hooks/useProfile";
// import { Country, City, ICountry, ICity } from "country-state-city";
// import { motion, AnimatePresence } from "framer-motion";

// // ------------------- Interfaces -------------------
// export interface UserProfile {
//   id: string;
//   first_name: string;
//   last_name: string;
//   gender: string;
//   phone: string;
//   country: string;
//   city: string;
//   address: string;
//   postal_code: string;
//   date_of_birth: string;
//   profile_picture: string | null;
//   bio: string;
//   average_rating: string;
//   total_reviews: number;
//   completed_deliveries: number;
//   cancelled_deliveries: number;
//   created_at: string;
//   updated_at: string;
//   email?: string;
//   role?: string;
// }

// export interface ProfileApiResponse {
//   message: string;
//   data: UserProfile;
// }

// export interface UpdateProfilePayload {
//   first_name: string;
//   last_name: string;
//   gender?: string;
//   phone?: string;
//   country: string;
//   city: string;
//   address: string;
//   postal_code: string;
//   date_of_birth: string;
//   bio?: string;
//   profile_picture?: File | null;
// }

// // ------------------- Schema -------------------
// const profileSchema = z.object({
//   firstName: z.string().min(2, "First name must be at least 2 characters"),
//   lastName: z.string().min(2, "Last name must be at least 2 characters"),
//   gender: z.string().min(1, "Gender is required"),
//   email: z.string().email("Invalid email address").optional().or(z.literal("")),
//   phone: z.string().min(5, "Invalid phone number").optional().or(z.literal("")),
//   country: z.string().min(1, "Country is required"),
//   city: z.string().min(1, "City is required"),
//   address: z.string().min(1, "Address is required"),
//   postalCode: z.string().min(1, "Postal code is required"),
//   dateOfBirth: z.string().min(1, "Date of birth is required"),
//   bio: z
//     .string()
//     .max(500, "Bio cannot exceed 500 characters")
//     .optional()
//     .or(z.literal("")),
// });

// type ProfileForm = z.infer<typeof profileSchema>;

// export const ProfileContent = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const roleFromUrl = searchParams.get("role") ?? "";

//   const { profile, isLoading, error, updateProfile } = useProfile();

//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [successMsg, setSuccessMsg] = useState<string | null>(null);

//   const previewUrl = useMemo(() => {
//     if (profilePhoto) return URL.createObjectURL(profilePhoto);
//     return null;
//   }, [profilePhoto]);

//   useEffect(() => {
//     return () => {
//       if (previewUrl) URL.revokeObjectURL(previewUrl);
//     };
//   }, [previewUrl]);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     watch,
//     setValue,
//     formState: { errors, isSubmitting },
//   } = useForm<ProfileForm>({
//     resolver: zodResolver(profileSchema),
//   });

//   // Get all countries from country-state-city package
//   const allCountries: ICountry[] = useMemo(() => Country.getAllCountries(), []);

//   // Watch the selected country input
//   const watchedCountry = watch("country");

//   // Find country object by Name or ISO Code
//   const selectedCountryObj = useMemo(() => {
//     if (!watchedCountry) return null;
//     return allCountries.find(
//       (c) =>
//         c.name.toLowerCase() === watchedCountry.toLowerCase() ||
//         c.isoCode.toLowerCase() === watchedCountry.toLowerCase()
//     );
//   }, [watchedCountry, allCountries]);

//   // Get cities only for the selected country
//   const countryCities: ICity[] = useMemo(() => {
//     if (!selectedCountryObj?.isoCode) return [];
//     return City.getCitiesOfCountry(selectedCountryObj.isoCode) || [];
//   }, [selectedCountryObj]);

//   const populateFields = () => {
//     if (profile) {
//       reset({
//         firstName: profile.first_name || "",
//         lastName: profile.last_name || "",
//         gender: profile.gender || "",
//         email: profile.email || "",
//         phone: profile.phone || "",
//         country: profile.country || "",
//         city: profile.city || "",
//         address: profile.address || "",
//         postalCode: profile.postal_code || "",
//         dateOfBirth: profile.date_of_birth || "",
//         bio: profile.bio || "",
//       });

//       if (!profile.country || !profile.city || !profile.first_name || !profile.gender) {
//         setIsEditing(true);
//       }
//     }
//   };

//   useEffect(() => {
//     populateFields();
//   }, [profile, reset]);

//   const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newCountry = e.target.value;
//     setValue("country", newCountry);
//     // Reset city field whenever country changes
//     setValue("city", "");
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setProfilePhoto(null);
//     setSubmitError(null);
//     populateFields();
//   };

//   const onSubmit = async (data: ProfileForm) => {
//     setSubmitError(null);
//     setSuccessMsg(null);
//     try {
//       const payload: UpdateProfilePayload = {
//         first_name: data.firstName,
//         last_name: data.lastName,
//         gender: data.gender,
//         phone: data.phone,
//         country: data.country,
//         city: data.city,
//         address: data.address,
//         postal_code: data.postalCode,
//         date_of_birth: data.dateOfBirth,
//         bio: data.bio,
//         profile_picture: profilePhoto,
//       };

//       await updateProfile(payload as any);

//       setSuccessMsg("Profile onboarding complete!");
//       setIsEditing(false);

//       const userRole = (profile?.role || roleFromUrl || "").toLowerCase();

//       setTimeout(() => {
//         if (userRole === "traveler") {
//           router.push("/verification");
//         } else {
//           router.push("/dashboard");
//         }
//       }, 1200);
//     } catch (err: any) {
//       setSubmitError(err.message || "Failed to save profile details");
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setProfilePhoto(e.target.files[0]);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
//         <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
//         <p className="text-xs font-bold text-slate-400">Loading your profile...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <motion.div 
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="p-8 text-center text-red-500 max-w-lg mx-auto bg-red-50/80 backdrop-blur-md border border-red-200 rounded-3xl my-12 shadow-sm"
//       >
//         <p className="font-semibold text-sm">{error}</p>
//         <button
//           onClick={() => router.push("/login")}
//           className="mt-4 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition cursor-pointer shadow-sm"
//         >
//           Re-login to Continue
//         </button>
//       </motion.div>
//     );
//   }

//   const fallbackLetter = profile?.first_name ? profile.first_name[0] : "A";

//   const getProfilePictureUrl = (
//     url: string | null | undefined
//   ): string | null => {
//     if (!url) return null;
//     if (url.startsWith("http://") || url.startsWith("https://")) return url;
//     const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
//     return `${baseUrl}${url}`;
//   };

//   const resolvedPictureUrl = getProfilePictureUrl(profile?.profile_picture);

//   return (
//     <motion.div 
//       initial={{ opacity: 0, y: 15 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, ease: "easeOut" }}
//       className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-montserrat"
//     >
//       <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden backdrop-blur-sm">
//         {/* Banner with modern decorative blurred background */}
//         <div className="h-44 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12 pointer-events-none" />
//           <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-300/20 rounded-full blur-xl pointer-events-none" />
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-10 -mt-20">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-8 border-b border-slate-100">
//             <div className="flex items-end gap-6">
//               <div className="relative group">
//                 <motion.label
//                   whileHover={isEditing ? { scale: 1.03 } : {}}
//                   htmlFor="profile-photo"
//                   className={`flex justify-center items-center w-32 h-32 border-4 border-white rounded-full relative overflow-hidden shrink-0 shadow-lg ${
//                     isEditing ? "cursor-pointer" : "cursor-default"
//                   }`}
//                 >
//                   {previewUrl ? (
//                     <Image
//                       src={previewUrl}
//                       alt="Preview"
//                       fill
//                       className="object-cover rounded-full"
//                       unoptimized
//                     />
//                   ) : resolvedPictureUrl ? (
//                     <Image
//                       src={resolvedPictureUrl}
//                       alt="Profile"
//                       fill
//                       className="object-cover rounded-full"
//                       unoptimized
//                     />
//                   ) : (
//                     <div
//                       className="w-full h-full flex items-center justify-center text-white text-4xl font-black"
//                       style={{
//                         backgroundColor: stringToColor(
//                           profile?.first_name || "A"
//                         ),
//                       }}
//                     >
//                       {fallbackLetter.toUpperCase()}
//                     </div>
//                   )}

//                   {isEditing && (
//                     <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
//                       <Camera className="text-white w-8 h-8" />
//                     </div>
//                   )}
//                 </motion.label>

//                 {isEditing && (
//                   <input
//                     type="file"
//                     id="profile-photo"
//                     onChange={handleFileChange}
//                     className="hidden"
//                     accept="image/*"
//                   />
//                 )}
//               </div>

//               <div className="mb-2">
//                 <div className="flex items-center gap-2">
//                   <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
//                     {profile?.first_name} {profile?.last_name}
//                   </h1>
//                   <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
//                 </div>
//                 <p className="text-xs sm:text-sm font-bold text-slate-500 flex items-center gap-2 mt-1">
//                   <Mail className="w-4 h-4 text-amber-500 shrink-0" />
//                   {profile?.email || "No email provided"}
//                 </p>
//               </div>
//             </div>

//             {!isEditing ? (
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 type="button"
//                 onClick={() => setIsEditing(true)}
//                 className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black rounded-2xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2.5 self-stretch sm:self-auto justify-center cursor-pointer"
//               >
//                 <Edit3 className="w-4 h-4 text-white" />
//                 <span className="text-white">Edit Profile</span>
//               </motion.button>
//             ) : (
//               <div className="flex items-center gap-3 w-full sm:w-auto">
//                 <button
//                   type="button"
//                   onClick={handleCancel}
//                   className="flex-1 sm:flex-none px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer"
//                 >
//                   <X className="w-4 h-4" /> Cancel
//                 </button>
//               </div>
//             )}
//           </div>

//           <AnimatePresence mode="wait">
//             {submitError && (
//               <motion.div 
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200/80 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-2xs"
//               >
//                 <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
//                 {submitError}
//               </motion.div>
//             )}

//             {successMsg && (
//               <motion.div 
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 className="mt-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-2xs"
//               >
//                 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
//                 {successMsg}
//               </motion.div>
//             )}
//           </AnimatePresence>

//           <div className="mt-8 space-y-10">
//             {/* Personal Details Section */}
//             <div>
//               <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
//                 <UserIcon className="w-4 h-4 text-amber-500" /> Personal Details
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 <div>
//                   <label
//                     htmlFor="first-name"
//                     className="block text-xs font-bold text-slate-700 mb-2"
//                   >
//                     First Name
//                   </label>
//                   <input
//                     type="text"
//                     id="first-name"
//                     disabled={!isEditing}
//                     {...register("firstName")}
//                     placeholder="Enter first name"
//                     className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
//                       isEditing
//                         ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
//                         : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
//                     }`}
//                   />
//                   {errors.firstName && (
//                     <p className="text-red-500 text-[11px] font-bold mt-1.5">
//                       {errors.firstName.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="last-name"
//                     className="block text-xs font-bold text-slate-700 mb-2"
//                   >
//                     Last Name
//                   </label>
//                   <input
//                     type="text"
//                     id="last-name"
//                     disabled={!isEditing}
//                     {...register("lastName")}
//                     placeholder="Enter last name"
//                     className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
//                       isEditing
//                         ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
//                         : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
//                     }`}
//                   />
//                   {errors.lastName && (
//                     <p className="text-red-500 text-[11px] font-bold mt-1.5">
//                       {errors.lastName.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="gender"
//                     className="block text-xs font-bold text-slate-700 mb-2"
//                   >
//                     Gender
//                   </label>
//                   <select
//                     id="gender"
//                     disabled={!isEditing}
//                     {...register("gender")}
//                     className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
//                       isEditing
//                         ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs cursor-pointer"
//                         : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
//                     }`}
//                   >
//                     <option value="">Select Gender</option>
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                     <option value="prefer_not_to_say">Prefer not to say</option>
//                   </select>
//                   {errors.gender && (
//                     <p className="text-red-500 text-[11px] font-bold mt-1.5">
//                       {errors.gender.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="email"
//                     className="block text-xs font-bold text-slate-700 mb-2"
//                   >
//                     Email Address{" "}
//                     <span className="text-slate-400 font-medium">
//                       (Non-editable)
//                     </span>
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     disabled
//                     {...register("email")}
//                     className="w-full text-xs font-bold p-3.5 rounded-2xl border border-slate-200/80 bg-slate-100 text-slate-500 cursor-not-allowed"
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="phone"
//                     className="block text-xs font-bold text-slate-700 mb-2"
//                   >
//                     Phone Number
//                   </label>
//                   <input
//                     type="tel"
//                     id="phone"
//                     disabled={!isEditing}
//                     {...register("phone")}
//                     placeholder="Enter phone number"
//                     className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
//                       isEditing
//                         ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
//                         : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
//                     }`}
//                   />
//                   {errors.phone && (
//                     <p className="text-red-500 text-[11px] font-bold mt-1.5">
//                       {errors.phone.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="date-of-birth"
//                     className="block text-xs font-bold text-slate-700 mb-2"
//                   >
//                     Date of Birth
//                   </label>
//                   <input
//                     type="date"
//                     id="date-of-birth"
//                     disabled={!isEditing}
//                     {...register("dateOfBirth")}
//                     className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
//                       isEditing
//                         ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
//                         : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
//                     }`}
//                   />
//                   {errors.dateOfBirth && (
//                     <p className="text-red-500 text-[11px] font-bold mt-1.5">
//                       {errors.dateOfBirth.message}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Location Details Section */}
//             <div>
//               <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
//                 <MapPin className="w-4 h-4 text-amber-500" /> Location Details
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 {/* Country Dropdown */}
//                 <div>
//                   <label
//                     htmlFor="country"
//                     className="block text-xs font-bold text-slate-700 mb-2"
//                   >
//                     Country
//                   </label>
//                   <select
//                     id="country"
//                     disabled={!isEditing}
//                     {...register("country")}
//                     onChange={handleCountryChange}
//                     className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
//                       isEditing
//                         ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs cursor-pointer"
//                         : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
//                     }`}
//                   >
//                     <option value="">Select Country</option>
//                     {allCountries.map((c) => (
//                       <option key={c.isoCode} value={c.name}>
//                         {c.name}
//                       </option>
//                     ))}
//                   </select>
//                   {errors.country && (
//                     <p className="text-red-500 text-[11px] font-bold mt-1.5">
//                       {errors.country.message}
//                     </p>
//                   )}
//                 </div>

//                 {/* Filtered City Dropdown */}
//                 <div>
//                   <label
//                     htmlFor="city"
//                     className="block text-xs font-bold text-slate-700 mb-2"
//                   >
//                     City
//                   </label>
//                   {countryCities.length > 0 ? (
//                     <select
//                       id="city"
//                       disabled={!isEditing || !watchedCountry}
//                       {...register("city")}
//                       className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
//                         isEditing && watchedCountry
//                           ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs cursor-pointer"
//                           : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
//                       }`}
//                     >
//                       <option value="">Select City</option>
//                       {countryCities.map((cityObj, idx) => (
//                         <option
//                           key={`${cityObj.name}-${idx}`}
//                           value={cityObj.name}
//                         >
//                           {cityObj.name}
//                         </option>
//                       ))}
//                     </select>
//                   ) : (
//                     <input
//                       type="text"
//                       id="city"
//                       disabled={!isEditing || !watchedCountry}
//                       {...register("city")}
//                       placeholder={
//                         watchedCountry
//                           ? "Enter city name"
//                           : "Select country first"
//                       }
//                       className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
//                         isEditing && watchedCountry
//                           ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
//                           : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
//                       }`}
//                     />
//                   )}
//                   {errors.city && (
//                     <p className="text-red-500 text-[11px] font-bold mt-1.5">
//                       {errors.city.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="postal-code"
//                     className="block text-xs font-bold text-slate-700 mb-2"
//                   >
//                     Postal Code
//                   </label>
//                   <input
//                     type="text"
//                     id="postal-code"
//                     disabled={!isEditing}
//                     {...register("postalCode")}
//                     placeholder="Postal code"
//                     className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
//                       isEditing
//                         ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
//                         : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
//                     }`}
//                   />
//                   {errors.postalCode && (
//                     <p className="text-red-500 text-[11px] font-bold mt-1.5">
//                       {errors.postalCode.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="md:col-span-3">
//                   <label
//                     htmlFor="address"
//                     className="block text-xs font-bold text-slate-700 mb-2"
//                   >
//                     Street Address
//                   </label>
//                   <input
//                     type="text"
//                     id="address"
//                     disabled={!isEditing}
//                     {...register("address")}
//                     placeholder="Enter street address"
//                     className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
//                       isEditing
//                         ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
//                         : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
//                     }`}
//                   />
//                   {errors.address && (
//                     <p className="text-red-500 text-[11px] font-bold mt-1.5">
//                       {errors.address.message}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* About Bio Section */}
//             <div>
//               <label
//                 htmlFor="bio"
//                 className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3"
//               >
//                 About Bio
//               </label>
//               <textarea
//                 id="bio"
//                 rows={4}
//                 disabled={!isEditing}
//                 {...register("bio")}
//                 placeholder="Tell us a little bit about yourself..."
//                 className={`w-full text-xs font-medium p-4 rounded-2xl border transition-all focus:outline-none resize-none leading-relaxed ${
//                   isEditing
//                     ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
//                     : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
//                 }`}
//               />
//               {errors.bio && (
//                 <p className="text-red-500 text-[11px] font-bold mt-1.5">
//                   {errors.bio.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Action Buttons */}
//           {isEditing && (
//             <motion.div 
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-4"
//             >
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-2xl text-xs font-black shadow-md shadow-amber-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin text-white" />
//                     <span className="text-white">Saving...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Save className="w-4 h-4 text-white" />
//                     <span className="text-white">Complete Onboarding</span>
//                   </>
//                 )}
//               </motion.button>
//             </motion.div>
//           )}
//         </form>
//       </div>
//     </motion.div>
//   );
// };

// export const Profile = () => {
//   return (
//     <Suspense
//       fallback={
//         <div className="flex justify-center items-center min-h-[500px]">
//           <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
//         </div>
//       }
//     >
//       <ProfileContent />
//     </Suspense>
//   );
// };



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
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { stringToColor } from "@/lib/stringToColor";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfile } from "@/hooks/useProfile";
import { Country, City, ICountry, ICity } from "country-state-city";
import { motion, AnimatePresence } from "framer-motion";
import { setUserRole } from "@/lib/auth"; // Added import

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postal_code: string;
  date_of_birth: string;
  profile_picture: string | null;
  bio: string;
  average_rating: string;
  total_reviews: number;
  completed_deliveries: number;
  cancelled_deliveries: number;
  created_at: string;
  updated_at: string;
  email?: string;
  role?: string;
}

export interface ProfileApiResponse {
  message: string;
  data: UserProfile;
}

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  gender?: string;
  phone?: string;
  country: string;
  city: string;
  address: string;
  postal_code: string;
  date_of_birth: string;
  bio?: string;
  profile_picture?: File | null;
}

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  gender: z.string().min(1, "Gender is required"),
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

export const ProfileContent = () => {
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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const allCountries: ICountry[] = useMemo(() => Country.getAllCountries(), []);
  const watchedCountry = watch("country");

  const selectedCountryObj = useMemo(() => {
    if (!watchedCountry) return null;
    return allCountries.find(
      (c) =>
        c.name.toLowerCase() === watchedCountry.toLowerCase() ||
        c.isoCode.toLowerCase() === watchedCountry.toLowerCase()
    );
  }, [watchedCountry, allCountries]);

  const countryCities: ICity[] = useMemo(() => {
    if (!selectedCountryObj?.isoCode) return [];
    return City.getCitiesOfCountry(selectedCountryObj.isoCode) || [];
  }, [selectedCountryObj]);

  const populateFields = () => {
    if (profile) {
      reset({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        gender: profile.gender || "",
        email: profile.email || "",
        phone: profile.phone || "",
        country: profile.country || "",
        city: profile.city || "",
        address: profile.address || "",
        postalCode: profile.postal_code || "",
        dateOfBirth: profile.date_of_birth || "",
        bio: profile.bio || "",
      });

      if (!profile.country || !profile.city || !profile.first_name || !profile.gender) {
        setIsEditing(true);
      }
    }
  };

  useEffect(() => {
    populateFields();
  }, [profile, reset]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setValue("country", newCountry);
    setValue("city", "");
  };

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
      const payload: UpdateProfilePayload = {
        first_name: data.firstName,
        last_name: data.lastName,
        gender: data.gender,
        phone: data.phone,
        country: data.country,
        city: data.city,
        address: data.address,
        postal_code: data.postalCode,
        date_of_birth: data.dateOfBirth,
        bio: data.bio,
        profile_picture: profilePhoto,
      };

      const updatedRes: any = await updateProfile(payload as any);

      // Resolve updated role from response, profile hook, or URL fallback
      const detectedRole =
        updatedRes?.role ||
        updatedRes?.data?.role ||
        profile?.role ||
        roleFromUrl;

      if (detectedRole) {
        setUserRole(detectedRole); // Writes normalized role to localStorage
      }

      setSuccessMsg("Profile onboarding complete!");
      setIsEditing(false);

      const normalizedRole = (detectedRole || "").trim().toUpperCase();

      setTimeout(() => {
        if (normalizedRole === "TRAVELER" || normalizedRole === "TRAVELLER") {
          router.push("/verification");
        } else if (normalizedRole === "ADMIN") {
          window.location.href = "http://localhost:3600/admin";
        } else {
          router.push("/dashboard");
        }
      }, 1000);
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
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="text-xs font-bold text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 text-center text-red-500 max-w-lg mx-auto bg-red-50/80 backdrop-blur-md border border-red-200 rounded-3xl my-12 shadow-sm"
      >
        <p className="font-semibold text-sm">{error}</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition cursor-pointer shadow-sm"
        >
          Re-login to Continue
        </button>
      </motion.div>
    );
  }

  const fallbackLetter = profile?.first_name ? profile.first_name[0] : "A";

  const getProfilePictureUrl = (
    url: string | null | undefined
  ): string | null => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    return `${baseUrl}${url}`;
  };

  const resolvedPictureUrl = getProfilePictureUrl(profile?.profile_picture);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-montserrat"
    >
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden backdrop-blur-sm">
        <div className="h-44 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl transform translate-x-12 -translate-y-12 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-300/20 rounded-full blur-xl pointer-events-none" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-10 -mt-20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-8 border-b border-slate-100">
            <div className="flex items-end gap-6">
              <div className="relative group">
                <motion.label
                  whileHover={isEditing ? { scale: 1.03 } : {}}
                  htmlFor="profile-photo"
                  className={`flex justify-center items-center w-32 h-32 border-4 border-white rounded-full relative overflow-hidden shrink-0 shadow-lg ${
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
                      className="w-full h-full flex items-center justify-center text-white text-4xl font-black"
                      style={{
                        backgroundColor: stringToColor(
                          profile?.first_name || "A"
                        ),
                      }}
                    >
                      {fallbackLetter.toUpperCase()}
                    </div>
                  )}

                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  )}
                </motion.label>

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

              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {profile?.first_name} {profile?.last_name}
                  </h1>
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-500 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                  {profile?.email || "No email provided"}
                </p>
              </div>
            </div>

            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black rounded-2xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2.5 self-stretch sm:self-auto justify-center cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-white" />
                <span className="text-white">Edit Profile</span>
              </motion.button>
            ) : (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 sm:flex-none px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {submitError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200/80 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                {submitError}
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 space-y-10">
            <div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-amber-500" /> Personal Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="first-name" className="block text-xs font-bold text-slate-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first-name"
                    disabled={!isEditing}
                    {...register("firstName")}
                    placeholder="Enter first name"
                    className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
                      isEditing
                        ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
                        : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last-name" className="block text-xs font-bold text-slate-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last-name"
                    disabled={!isEditing}
                    {...register("lastName")}
                    placeholder="Enter last name"
                    className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
                      isEditing
                        ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
                        : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-xs font-bold text-slate-700 mb-2">
                    Gender
                  </label>
                  <select
                    id="gender"
                    disabled={!isEditing}
                    {...register("gender")}
                    className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
                      isEditing
                        ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs cursor-pointer"
                        : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.gender.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-2">
                    Email Address <span className="text-slate-400 font-medium">(Non-editable)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    disabled
                    {...register("email")}
                    className="w-full text-xs font-bold p-3.5 rounded-2xl border border-slate-200/80 bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    disabled={!isEditing}
                    {...register("phone")}
                    placeholder="Enter phone number"
                    className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
                      isEditing
                        ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
                        : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="date-of-birth" className="block text-xs font-bold text-slate-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="date-of-birth"
                    disabled={!isEditing}
                    {...register("dateOfBirth")}
                    className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
                      isEditing
                        ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
                        : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.dateOfBirth.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" /> Location Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="country" className="block text-xs font-bold text-slate-700 mb-2">
                    Country
                  </label>
                  <select
                    id="country"
                    disabled={!isEditing}
                    {...register("country")}
                    onChange={handleCountryChange}
                    className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
                      isEditing
                        ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs cursor-pointer"
                        : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
                    }`}
                  >
                    <option value="">Select Country</option>
                    {allCountries.map((c) => (
                      <option key={c.isoCode} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.country.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-xs font-bold text-slate-700 mb-2">
                    City
                  </label>
                  {countryCities.length > 0 ? (
                    <select
                      id="city"
                      disabled={!isEditing || !watchedCountry}
                      {...register("city")}
                      className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
                        isEditing && watchedCountry
                          ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs cursor-pointer"
                          : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
                      }`}
                    >
                      <option value="">Select City</option>
                      {countryCities.map((cityObj, idx) => (
                        <option key={`${cityObj.name}-${idx}`} value={cityObj.name}>
                          {cityObj.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id="city"
                      disabled={!isEditing || !watchedCountry}
                      {...register("city")}
                      placeholder={watchedCountry ? "Enter city name" : "Select country first"}
                      className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
                        isEditing && watchedCountry
                          ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
                          : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
                      }`}
                    />
                  )}
                  {errors.city && (
                    <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="postal-code" className="block text-xs font-bold text-slate-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postal-code"
                    disabled={!isEditing}
                    {...register("postalCode")}
                    placeholder="Postal code"
                    className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
                      isEditing
                        ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
                        : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.postalCode.message}</p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label htmlFor="address" className="block text-xs font-bold text-slate-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    disabled={!isEditing}
                    {...register("address")}
                    placeholder="Enter street address"
                    className={`w-full text-xs font-bold p-3.5 rounded-2xl border transition-all focus:outline-none ${
                      isEditing
                        ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
                        : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.address.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                About Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                disabled={!isEditing}
                {...register("bio")}
                placeholder="Tell us a little bit about yourself..."
                className={`w-full text-xs font-medium p-4 rounded-2xl border transition-all focus:outline-none resize-none leading-relaxed ${
                  isEditing
                    ? "bg-white border-slate-300 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 shadow-2xs"
                    : "bg-slate-50/80 border-slate-200/80 text-slate-800 cursor-not-allowed"
                }`}
              />
              {errors.bio && (
                <p className="text-red-500 text-[11px] font-bold mt-1.5">{errors.bio.message}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-2xl text-xs font-black shadow-md shadow-amber-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span className="text-white">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span className="text-white">Complete Onboarding</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export const Profile = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[500px]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
};
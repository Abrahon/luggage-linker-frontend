"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Check, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { postJson } from "@/lib/api";

// 1️⃣ Define Zod schema for validation
const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
    role: z.enum(["sender", "traveler"]).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// 2️⃣ Define TypeScript type from schema
type SignUpForm = z.infer<typeof signUpSchema>;

export const SignUp = () => {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const roleValue =
    roleParam === "sender" || roleParam === "traveler" ? roleParam : undefined;
  const roleLabel =
    roleValue === "traveler"
      ? "Traveler"
      : roleValue === "sender"
      ? "Sender"
      : "";

  // Eye toggle states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();

  // 3️⃣ Initialize useForm with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: roleValue,
    },
  });

  // 4️⃣ Submit function
  const onSubmit = async (data: SignUpForm) => {
    if (!accepted) {
      toast.error("Please accept TSA & Terms");
      return;
    }

    const roleValue =
      data.role === "sender"
        ? "SENDER"
        : data.role === "traveler"
        ? "TRAVELER"
        : undefined;

    if (!roleValue) {
      toast.error("Please choose a role from the previous page.");
      return;
    }

    try {
      await postJson("/api/signup/", {
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
        role: roleValue,
      });

      toast.success("Signup successful! Please check your email for the OTP.");
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed.";
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto text-white">
      <h2 className="text-2xl font-semibold text-center">
        {roleLabel ? `${roleLabel} Sign Up` : "Sign Up"}
      </h2>

      {roleLabel ? (
        <p className="text-sm text-center text-gray-300">
          Creating an account as a <span className="font-semibold text-white">{roleLabel}</span>.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-center text-gray-300">
            Choose your role from the previous page to continue.
          </p>
          <div className="text-center">
            <Link href="/choose-user" className="text-primary underline">
              Pick role and return to signup
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-lg px-3 py-2">
              <Mail className="w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-400"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 relative">
            <label htmlFor="password">Password</label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-lg px-3 py-2">
              <Lock className="w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 relative">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="flex items-center gap-2 border border-gray-400 rounded-lg px-3 py-2">
              <Lock className="w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="text-gray-400 hover:text-white"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              className={`p-1 border border-white/40 flex items-center justify-center ${
                accepted ? "bg-white/20" : ""
              }`}
              onClick={() => setAccepted(!accepted)}
            >
              {accepted && <Check className="text-white w-2 h-2" />}
            </button>
            <p className="text-sm text-gray-200">
              By continuing, you agree to our <Link href="/tsa" className="text-primary">
                TSA Compliance Agreement
              </Link>{" "}
              & <Link href="/terms" className="text-primary">
                Terms & Conditions
              </Link>
            </p>
          </div>

          <input type="hidden" value={roleParam ?? ""} {...register("role")} />

          <button
            type="submit"
            disabled={!accepted || !roleValue}
            className={`mt-4 px-4 py-2 rounded-lg ${
              accepted && roleValue
                ? "bg-primary text-white"
                : "bg-gray-500 text-gray-200 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </form>

      <p className="text-center text-gray-200 mt-4">
        Have an account? <Link href="/login" className="text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
};

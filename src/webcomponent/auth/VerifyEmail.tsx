"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { verifyEmail } from "@/lib/api";
import { setAccessToken, setRefreshToken } from "@/lib/token";
import { useAuth } from "@/context/AuthContext";

const OTP_LENGTH = 6;

export const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const role = searchParams.get("role") ?? "";

  // Consume AuthContext state handler
  const { login: authLogin } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto focus first OTP field on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const updatedOtp = [...otp];
    // Handle single character or pasted values in individual input
    if (value.length > 1) {
      const pastedDigits = value.slice(0, OTP_LENGTH).split("");
      pastedDigits.forEach((digit, i) => {
        if (i < OTP_LENGTH) updatedOtp[i] = digit;
      });
      setOtp(updatedOtp);
      const nextFocus = Math.min(pastedDigits.length, OTP_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    updatedOtp[index] = value;
    setOtp(updatedOtp);

    // Auto focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, OTP_LENGTH).split("");
    const updatedOtp = [...otp];
    digits.forEach((digit, i) => {
      updatedOtp[i] = digit;
    });
    setOtp(updatedOtp);
    inputRefs.current[Math.min(digits.length - 1, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fullOtp = otp.join("");

    if (!email) {
      toast.error("Email is missing. Please sign up first.");
      return;
    }

    if (fullOtp.length < OTP_LENGTH) {
      toast.error(`Please enter the complete ${OTP_LENGTH}-digit OTP code.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = (await verifyEmail(email, fullOtp)) as Record<
        string,
        unknown
      >;

      const getNestedValue = (key: string): unknown => {
        const value = response[key];
        if (value !== undefined) return value;

        const data = response.data;
        if (data && typeof data === "object") {
          return (data as Record<string, unknown>)[key];
        }

        return undefined;
      };

      const accessToken =
        (getNestedValue("access") as string | undefined) ||
        (getNestedValue("accessToken") as string | undefined) ||
        (getNestedValue("token") as string | undefined);

      const refreshToken =
        (getNestedValue("refresh") as string | undefined) ||
        (getNestedValue("refreshToken") as string | undefined);

      const userObj =
        (response.user as Record<string, unknown> | undefined) ||
        ((response.data as Record<string, unknown> | undefined)?.user as
          | Record<string, unknown>
          | undefined) ||
        { email };

      if (accessToken) {
        setAccessToken(accessToken);
        if (refreshToken) setRefreshToken(refreshToken);

        if (typeof authLogin === "function") {
          authLogin(accessToken, userObj);
        }
      }

      toast.success("Email verified successfully!");

      const resolvedUserRole = (
        response?.role ||
        response?.user?.role ||
        response?.data?.role ||
        role ||
        ""
      ).toLowerCase();

      // 3. Perform hard redirect so client state & headers synchronize clean
      setTimeout(() => {
        window.location.href = `/profile?email=${encodeURIComponent(
          email,
        )}&role=${encodeURIComponent(resolvedUserRole)}`;
      }, 300);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Verification failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto text-white">
      <h2 className="text-2xl font-semibold text-center">Verify Your Email</h2>
      <p className="text-sm text-center text-gray-300">
        Enter the verification code sent to{" "}
        <span className="font-semibold text-white">
          {email || "your email"}
        </span>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="verify-email" className="text-xs text-gray-300">
            Email Address
          </label>
          <input
            id="verify-email"
            type="email"
            value={email}
            readOnly
            className="w-full rounded-lg border border-gray-600 bg-slate-950/40 px-3 py-2 text-white outline-none cursor-not-allowed opacity-80"
          />
        </div>

        {/* Digit Box OTP Input with Copy Paste */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-300">Verification Code</label>
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-gray-500 bg-slate-900/60 text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 font-semibold text-slate-950 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Verifying..." : "Verify & Continue"}
        </button>
      </form>

      {!email && (
        <p className="text-sm text-center text-red-400">
          Email parameter missing.{" "}
          <Link href="/signup" className="text-amber-400 underline">
            Return to Sign Up
          </Link>
        </p>
      )}
    </div>
  );
};

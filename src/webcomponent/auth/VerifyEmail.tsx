"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { verifyEmail } from "@/lib/api";

export const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      toast.error("Email is missing. Please sign up first.");
      return;
    }

    if (!otp.trim()) {
      toast.error("Please enter the OTP.");
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyEmail(email, otp.trim());
      toast.success("Email verified! Please log in.");
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verification failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto text-white">
      <h2 className="text-2xl font-semibold text-center">Verify Your Email</h2>
      <p className="text-sm text-center text-gray-300">
        Enter the OTP sent to <span className="font-semibold text-white">{email || "your email"}</span>.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="verify-email">Email</label>
          <input
            id="verify-email"
            type="email"
            value={email}
            readOnly
            className="w-full rounded-lg border border-gray-400 bg-slate-950/30 px-3 py-2 text-white outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="otp">OTP Code</label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            placeholder="Enter OTP"
            className="w-full rounded-lg border border-gray-400 bg-transparent px-3 py-2 text-white outline-none placeholder:text-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50"
        >
          {isSubmitting ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      {!email && (
        <p className="text-sm text-center text-red-400">
          Email query is missing. <Link href="/signup" className="text-primary underline">Return to Sign Up</Link>
        </p>
      )}
    </div>
  );
};

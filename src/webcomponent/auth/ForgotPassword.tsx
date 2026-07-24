"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { forgotPassword, resendOtp, resetPassword, verifyForgotOtp } from "@/lib/api";

// ----------------------------
// Zod Schemas
// ----------------------------
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Email is required"),
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ----------------------------
// Types
// ----------------------------
type ForgotForm = z.infer<typeof forgotPasswordSchema>;
type ResetForm = z.infer<typeof resetPasswordSchema>;

// ----------------------------
// Component
// ----------------------------
export const ForgotPassword = () => {
  // ---------------------------- States ----------------------------
  const [step, setStep] = useState<"forgot" | "verify" | "reset">("forgot");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ---------------------------- Forms ----------------------------
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
  e.preventDefault();

  const pasted = e.clipboardData
    .getData("text")
    .replace(/\D/g, "")
    .slice(0, 6);

  if (!pasted) return;

  const newOtp = [...otp];

  pasted.split("").forEach((digit, index) => {
    newOtp[index] = digit;
  });

  setOtp(newOtp);

  // Focus the last filled input
  const lastIndex = Math.min(pasted.length - 1, 5);
  otpRefs.current[lastIndex]?.focus();
};

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
    watch: watchEmail,
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: errorsReset },
    watch: watchReset,
  } = useForm<ResetForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // ---------------------------- Timer for OTP ----------------------------
  useEffect(() => {
    let interval: number;
    if (step === "verify" && timer > 0) {
      interval = window.setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [step, timer]);

  // ---------------------------- Handlers ----------------------------
  const onSubmitEmail = async (data: ForgotForm) => {
    try {
      await forgotPassword(data.email);
      setEmail(data.email);
      toast.success("OTP sent to your email.");
      setStep("verify");
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send OTP.";
      toast.error(message);
    }
  };

  const onResend = async () => {
    try {
      await resendOtp(email);
      toast.success("OTP resent to your email.");
      setOtp(Array(6).fill(""));
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to resend OTP.";
      toast.error(message);
    }
  };

  const onSubmitOTP = async () => {
    if (otp.some((d) => d === "")) return;

    const otpCode = otp.join("");

    try {
      const response = await verifyForgotOtp(email, otpCode);
      if (response && typeof response === "object" && "reset_token" in response) {
        setResetToken((response as Record<string, unknown>).reset_token as string);
      }
      toast.success("OTP verified successfully.");
      setStep("reset");
    } catch (error) {
      const message = error instanceof Error ? error.message : "OTP verification failed.";
      toast.error(message);
    }
  };

  

  const onSubmitReset = async (data: ResetForm) => {
    try {
      await resetPassword(data.password, data.confirmPassword, resetToken || undefined);
      toast.success("Password reset successful.");
      setStep("forgot");
      setEmail("");
      setOtp(Array(6).fill(""));
      setResetToken("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reset password.";
      toast.error(message);
    }
  };

  // ---------------------------- Render ----------------------------
  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto text-white">
      {step === "forgot" && (
        <>
          <h2 className="text-2xl font-semibold text-center">
            Forgot Password
          </h2>
          <p className="text-gray-300 text-center mb-4">
            Enter your email address
          </p>

          <form
            onSubmit={handleSubmitEmail(onSubmitEmail)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="email">Email</label>
              <div className="flex items-center gap-2 border border-gray-400 rounded-lg px-3 py-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...registerEmail("email")}
                  className="w-full bg-transparent outline-none text-white placeholder:text-gray-400"
                />
              </div>
              {errorsEmail.email && (
                <p className="text-red-400 text-sm">
                  {errorsEmail.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!watchEmail("email")}
              className={`mt-2 px-4 py-2 rounded-lg ${
                watchEmail("email")
                  ? "bg-primary text-white"
                  : "bg-gray-500 text-gray-200 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </form>
        </>
      )}

      {step === "verify" && (
        <>
          <h2 className="text-2xl font-semibold text-center">Verify OTP</h2>
          <p className="text-gray-300 text-center">
            We sent a 6-digit code to <br />{" "}
            <span className="font-semibold">{email}</span>
          </p>

            <div className="flex justify-between mt-4">
              {otp.map((value, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");

                    const newOtp = [...otp];
                    newOtp[i] = val;
                    setOtp(newOtp);

                    if (val && i < otp.length - 1) {
                      otpRefs.current[i + 1]?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[i] && i > 0) {
                      otpRefs.current[i - 1]?.focus();
                    }

                    if (e.key === "ArrowLeft" && i > 0) {
                      otpRefs.current[i - 1]?.focus();
                    }

                    if (e.key === "ArrowRight" && i < otp.length - 1) {
                      otpRefs.current[i + 1]?.focus();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();

                    const pasted = e.clipboardData
                      .getData("text")
                      .replace(/\D/g, "")
                      .slice(0, otp.length);

                    if (!pasted) return;

                    const newOtp = [...otp];

                    pasted.split("").forEach((digit, index) => {
                      newOtp[index] = digit;
                    });

                    setOtp(newOtp);

                    const lastIndex = Math.min(pasted.length - 1, otp.length - 1);
                    otpRefs.current[lastIndex]?.focus();
                  }}
                  className="w-12 h-12 rounded-lg border border-gray-500 text-center text-xl font-bold text-white bg-transparent focus:border-primary focus:outline-none"
                />
              ))}
            </div>
          <button
            onClick={onSubmitOTP}
            disabled={otp.some((d) => d === "")}
            className={`mt-4 px-4 py-2 rounded-lg ${
              otp.some((d) => d === "")
                ? "bg-gray-500 text-gray-200 cursor-not-allowed"
                : "bg-primary text-white"
            }`}
          >
            Continue
          </button>

          <button
            disabled={!canResend}
            onClick={onResend}
            className={`mt-2 px-4 py-2 rounded-lg border border-white ${
              canResend ? "text-white" : "text-gray-400 pointer-events-none"
            }`}
          >
            {canResend
              ? "Resend Code"
              : `Resend in 00:${timer.toString().padStart(2, "0")}`}
          </button>
        </>
      )}

      {step === "reset" && (
        <>
          <h2 className="text-2xl font-semibold text-center">
            Create New Password
          </h2>

          <form
            onSubmit={handleSubmitReset(onSubmitReset)}
            className="flex flex-col gap-4"
          >
            {/* New Password */}
            <div className="flex flex-col gap-2 relative">
              <label htmlFor="password">New Password</label>
              <div className="flex items-center gap-2 border border-gray-400 rounded-lg px-3 py-2">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  {...registerReset("password")}
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
              {errorsReset.password && (
                <p className="text-red-400 text-sm">
                  {errorsReset.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2 relative">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="flex items-center gap-2 border border-gray-400 rounded-lg px-3 py-2">
                <Lock className="w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  {...registerReset("confirmPassword")}
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
              {errorsReset.confirmPassword && (
                <p className="text-red-400 text-sm">
                  {errorsReset.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                !watchReset("password") || !watchReset("confirmPassword")
              }
              className={`mt-4 px-4 py-2 rounded-lg ${
                watchReset("password") && watchReset("confirmPassword")
                  ? "bg-primary text-white"
                  : "bg-gray-500 text-gray-200 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </form>
        </>
      )}
    </div>
  );
};

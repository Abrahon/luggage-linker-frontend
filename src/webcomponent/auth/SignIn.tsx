"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
} from "lucide-react";
import { login as apiLogin } from "@/lib/api";
import { setAccessToken, setRefreshToken } from "@/lib/token";
import { setUserRole, setUserId } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuth, User } from "@/context/AuthContext";
import { toast } from "sonner";

// Zod validation
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type SignInFormData = z.infer<typeof signInSchema>;

export const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { login: authLogin } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    // Clear previous errors
    clearErrors();

    try {
      const response = await apiLogin<{
        success?: boolean;
        message?: string;
        role?: string;
        user?: {
          id?: string;
          email?: string;
          name?: string;
          first_name?: string;
          last_name?: string;
          role?: string;
          profile_picture?: string;
        };
        token?: {
          access?: string;
          refresh?: string;
        };
      }>(data.email, data.password);

      const accessToken = response.token?.access;
      const refreshToken = response.token?.refresh;

      if (accessToken) setAccessToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);

      if (response.user?.id) {
        setUserId(response.user.id);
      }

      const rawRole = (
        response.role ??
        response.user?.role ??
        ""
      )
        .trim()
        .toUpperCase();

      if (!rawRole) {
        throw new Error(
          "Login succeeded, but role data is missing."
        );
      }

      setUserRole(rawRole);

      let mappedRole: "SENDER" | "TRAVELER" | "ADMIN" = "SENDER";

      if (rawRole === "ADMIN") {
        mappedRole = "ADMIN";
      } else if (
        rawRole === "TRAVELER" ||
        rawRole === "TRAVELLER" ||
        rawRole === "CARRIER"
      ) {
        mappedRole = "TRAVELER";
      }

      const userPayload: User = {
        id: response.user?.id || "",
        email: response.user?.email || data.email,
        name:
          response.user?.name ||
          `${response.user?.first_name || ""} ${
            response.user?.last_name || ""
          }`.trim() ||
          data.email.split("@")[0],
        role: mappedRole,
        profile_picture: response.user?.profile_picture,
      };

      authLogin(accessToken || "", userPayload);

      // SUCCESS TOAST
      toast.success(
        response.message ||
          "Logged in successfully! Redirecting..."
      );

      const dashboardRoute =
        mappedRole === "ADMIN" ? "/admin" : "/dashboard";
      router.replace(dashboardRoute);
    } catch (error: any) {
      const resData = error?.response?.data || error;
      const fieldErrors = resData?.errors || resData;

      // =========================================================
      // 1. EMAIL ERRORS
      // =========================================================
      if (fieldErrors?.email) {
        const emailErr = fieldErrors.email;
        const code = emailErr.code || "";
        const msg =
          emailErr.message || "Email validation error.";

        if (code === "email_not_verified") {
          toast.warning("Email Verification Required", {
            description: msg,
            action: {
              label: "Verify Email",
              onClick: () => {
                router.push(
                  `/verify-email?email=${encodeURIComponent(
                    getValues("email") || ""
                  )}`
                );
              },
            },
          });

          return;
        }

        if (code === "account_suspended") {
          toast.error("Account Suspended", {
            description: msg,
          });

          return;
        }

        if (code === "account_locked") {
          toast.warning("Account Locked", {
            description: msg,
          });

          return;
        }

        // Standard Email Field Error
        setError("email", {
          type: "server",
          message: msg,
        });

        toast.error("Login Failed", {
          description: msg,
        });

        return;
      }

      // =========================================================
      // 2. PASSWORD ERRORS
      // =========================================================
      if (fieldErrors?.password) {
        const passErr = fieldErrors.password;
        const msg =
          passErr.message || "Incorrect password.";

        setError("password", {
          type: "server",
          message: msg,
        });

        toast.error("Authentication Error", {
          description: msg,
        });

        return;
      }

      // =========================================================
      // 3. FALLBACK GENERAL ERROR
      // =========================================================
      toast.error("Login Failed", {
        description:
          resData?.message ||
          "Invalid credentials or server error.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-white w-full px-6">
      <h2 className="text-2xl font-semibold mb-6">
        Sign in
      </h2>

      <div className="flex flex-col gap-5 w-full max-w-md">
        {/* ========================================================= */}
        {/* LOGIN FORM                                                */}
        {/* ========================================================= */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium"
            >
              Email
            </label>

            <div
              className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-colors ${
                errors.email
                  ? "border-red-500 bg-red-500/5"
                  : "border-gray-400 focus-within:border-white"
              }`}
            >
              <Mail className="w-5 h-5 text-gray-400" />

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-400 text-sm"
              />
            </div>

            {errors.email && (
              <p className="text-red-400 text-xs font-medium mt-0.5">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2 relative">
            <label
              htmlFor="password"
              className="text-sm font-medium"
            >
              Password
            </label>

            <div
              className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-colors ${
                errors.password
                  ? "border-red-500 bg-red-500/5"
                  : "border-gray-400 focus-within:border-white"
              }`}
            >
              <Lock className="w-5 h-5 text-gray-400" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-400 text-sm"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
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
              <p className="text-red-400 text-xs font-medium mt-0.5">
                {errors.password.message}
              </p>
            )}

            <Link
              href="/forgot-password"
              className="self-end text-xs text-primary hover:underline mt-1"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2"
          >
            {isSubmitting
              ? "Signing in..."
              : "Sign in"}
          </Button>
        </form>
      </div>

      <div className="text-center text-sm mt-6">
        Don’t have an account?{" "}
        <Link
          href="/choose-user"
          className="text-primary hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};
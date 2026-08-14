"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { login as apiLogin } from "@/lib/api";
import { toast } from "sonner";
import { setAccessToken, setRefreshToken } from "@/lib/token";
import { setUserRole, setUserId } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuth, User } from "@/context/AuthContext";

// Zod validation
const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const response = await apiLogin<{
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
        token?: { access?: string; refresh?: string };
      }>(data.email, data.password);

      const accessToken = response.token?.access;
      const refreshToken = response.token?.refresh;

      if (accessToken) setAccessToken(accessToken);
      if (refreshToken) setRefreshToken(refreshToken);

      // Save user ID for chat and profile features
      if (response.user?.id) {
        setUserId(response.user.id);
      }

      // Safely extract and normalize raw role
      const rawRole = (response.role ?? response.user?.role ?? "").trim().toUpperCase();
      if (!rawRole) {
        throw new Error("Login succeeded, but role data is missing.");
      }

      // Store normalized role in localStorage
      setUserRole(rawRole);

      // Determine explicit role mapping
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

      // Build User object and update AuthContext state
      const userPayload: User = {
        id: response.user?.id || "",
        email: response.user?.email || data.email,
        name:
          response.user?.name ||
          `${response.user?.first_name || ""} ${response.user?.last_name || ""}`.trim() ||
          data.email.split("@")[0],
        role: mappedRole,
        profile_picture: response.user?.profile_picture,
      };

      authLogin(accessToken || "", userPayload);

      toast.success(`Login successful! Role: ${mappedRole}`);

      // ✅ FIX: Route according to actual Next.js app directory structure
      if (mappedRole === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard"); // Redirects SENDER and TRAVELER to /dashboard
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed.";
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-white w-full px-6">
      <h2 className="text-2xl font-semibold mb-8">Sign in</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 w-full max-w-md"
      >
        {/* Email */}
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

        {/* Password */}
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
          <Link
            href="/forgot-password"
            className="self-end text-sm text-primary hover:underline mt-1"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="text-center text-sm mt-4">
        Don’t have an account?{" "}
        <Link href="/choose-user" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
};
// "use client";

// import { useEffect, useState } from "react";
// import { getUserRole } from "@/lib/auth";
// import { CarrierDashboard } from "../carrier";
// import { SenderDashboard } from "../sender";

// export const Dashboard = () => {
//   const [role, setRole] = useState<string | null>(null);
//   const [isMounted, setIsMounted] = useState<boolean>(false);

//   useEffect(() => {
//     // Read the role safely on client-side mount
//     const userRole = getUserRole()?.toUpperCase();
//     setRole(userRole || null);
//     setIsMounted(true);
//   }, []);

//   // Guarantee identical DOM tree during SSR & initial client hydration
//   if (!isMounted) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
//           <p className="text-sm font-medium text-slate-500">Loading Dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   const isTravelerOrCarrier =
//     role === "TRAVELER" || role === "TRAVELLER";

//   if (isTravelerOrCarrier) {
//     return <CarrierDashboard />;
//   }

//   if (role === "SENDER") {
//     return <SenderDashboard />;
//   }

//   return <div>Other Dashboard</div>;
// };

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserRole, setUserRole, UserRole } from "@/lib/auth";
import { getAccessToken } from "@/lib/token";
import { CarrierDashboard } from "../carrier";
import { SenderDashboard } from "../sender";

export const Dashboard = () => {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUserRole = async () => {
      try {
        let currentRole = getUserRole();

        // FALLBACK: Fetch updated role from backend if local storage is missing it
        if (!currentRole) {
          const token = getAccessToken();
          if (token) {
            const baseUrl =
              process.env.NEXT_PUBLIC_API_URL ||
              "https://z4f6lxvp-8001.asse.devtunnels.ms";

            const response = await fetch(`${baseUrl}/auth/me/`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (response.ok) {
              const resData = await response.json();

              // Parse nested object attributes safely
              const fetchedRole =
                resData?.role ||
                resData?.data?.role ||
                resData?.user?.role;

              if (fetchedRole) {
                setUserRole(fetchedRole);
                currentRole = getUserRole();
              }
            }
          }
        }

        if (!mounted) return;

        if (currentRole === "TRAVELER") {
          setRole("TRAVELER");
        } else if (currentRole === "SENDER") {
          setRole("SENDER");
        } else if (currentRole === "ADMIN") {
          setRole("ADMIN");
          window.location.href = "http://localhost:3600/admin";
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Failed to load user role:", error);
        if (mounted) setRole(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadUserRole();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (isLoading || role === "ADMIN") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">
            {role === "ADMIN"
              ? "Redirecting to Admin Portal..."
              : "Loading Dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  if (role === "TRAVELER") return <CarrierDashboard />;
  if (role === "SENDER") return <SenderDashboard />;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-amber-100 p-4">
        <svg
          className="h-8 w-8 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-slate-800">
        Unable to Load Dashboard
      </h2>

      <p className="max-w-md text-sm text-slate-600">
        Your account role could not be loaded. Please refresh the page or try logging in again.
      </p>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        Refresh
      </button>
    </div>
  );
};
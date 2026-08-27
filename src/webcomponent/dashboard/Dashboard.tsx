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
import { getUserRole } from "@/lib/auth";
import { CarrierDashboard } from "../carrier";
import { SenderDashboard } from "../sender";

type UserRole = "TRAVELER" | "TRAVELLER" | "SENDER" | "ADMIN" | null;

export const Dashboard = () => {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUserRole = () => {
      try {
        const storedRole = getUserRole();

        const normalizedRole = storedRole
          ?.trim()
          .toUpperCase();

        console.log("Dashboard user role:", normalizedRole);

        if (!mounted) return;

        if (
          normalizedRole === "TRAVELER" ||
          normalizedRole === "TRAVELLER"
        ) {
          setRole("TRAVELER");
        } else if (normalizedRole === "SENDER") {
          setRole("SENDER");
        } else if (normalizedRole === "ADMIN") {
          setRole("ADMIN");
          // Redirect to administrative dashboard route
          router.push("/admin");
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error(
          "Failed to load user role:",
          error
        );

        if (mounted) {
          setRole(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadUserRole();

    return () => {
      mounted = false;
    };
  }, [router]);

  // ==========================================================
  // LOADING (Also shows while redirecting ADMIN)
  // ==========================================================

  if (isLoading || role === "ADMIN") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />

          <p className="text-sm font-medium text-slate-500">
            {role === "ADMIN" ? "Redirecting to Admin Portal..." : "Loading Dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // TRAVELER
  // ==========================================================

  if (role === "TRAVELER") {
    return <CarrierDashboard />;
  }

  // ==========================================================
  // SENDER
  // ==========================================================

  if (role === "SENDER") {
    return <SenderDashboard />;
  }

  // ==========================================================
  // UNKNOWN / MISSING ROLE
  // ==========================================================

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
        Your account role could not be loaded. Please refresh the
        page and try again.
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
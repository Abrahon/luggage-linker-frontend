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
import { getUserRole } from "@/lib/auth";
import { CarrierDashboard } from "../carrier";
import { SenderDashboard } from "../sender";

export const Dashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    // Read the role safely on client-side mount
    const userRole = getUserRole()?.toUpperCase();
    console.log("Current User Role:", userRole); // Debug: Check what string is returned after onboarding
    setRole(userRole || null);
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const isTraveler = role === "TRAVELER" || role === "TRAVELLER";

  if (isTraveler) {
    return <CarrierDashboard />;
  }

  if (role === "SENDER") {
    return <SenderDashboard />;
  }

  // Handle case where role is missing or invalid after onboarding
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-xl font-bold text-slate-800">Account Setup Incomplete</h2>
      <p className="text-slate-600">
        Role found: <code className="bg-slate-100 px-2 py-1 rounded">{role || "No role assigned"}</code>
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium"
      >
        Refresh Dashboard
      </button>
    </div>
  );
};
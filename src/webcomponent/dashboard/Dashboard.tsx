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
    setRole(userRole || null);
    setIsMounted(true);
  }, []);

  // Guarantee identical DOM tree during SSR & initial client hydration
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

  const isTravelerOrCarrier =
    role === "TRAVELER" || role === "TRAVELLER";

  if (isTravelerOrCarrier) {
    return <CarrierDashboard />;
  }

  if (role === "SENDER") {
    return <SenderDashboard />;
  }

  return <div>Other Dashboard</div>;
};
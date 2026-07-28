"use client";

import { useState, useEffect } from "react";
import { getUserRole } from "@/lib/auth";
import { ActiveDelivaries } from "../carrier";
import { SenderActiveDelivaries } from "../sender";
import { Loader2 } from "lucide-react";

export const ActiveDelivariesRole = () => {
  const [role, setRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    // Read the user role safely on the browser side after hydration
    const currentRole = getUserRole();
    setRole(currentRole);
    setIsMounted(true);
  }, []);

  // Return a consistent layout during SSR / initial hydration
  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">Checking authorization...</p>
      </div>
    );
  }

  const isCarrierOrTraveler = role === "traveler" || role === "TRAVELER";

  if (isCarrierOrTraveler) {
    return <ActiveDelivaries />;
  }

  if (role === "sender" || role === "SENDER") {
    return <SenderActiveDelivaries />;
  }

  return <div className="py-16 text-center text-gray-500">Access Denied or Unknown Role</div>;
};
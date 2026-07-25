"use client";
import { getUserRole } from "@/lib/auth";
import { CarrierDashboard } from "../carrier";
import { SenderDashboard } from "../sender";

export const Dashboard = () => {
  // Normalize role string to uppercase to avoid case-mismatch issues
  const role = getUserRole()?.toUpperCase();

  return (
    <>
      {role === "TRAVELER" || role === "TRAVELLER" ? (
        <CarrierDashboard />
      ) : role === "SENDER" ? (
        <SenderDashboard />
      ) : (
        <div>Other Dashboard</div>
      )}
    </>
  );
};

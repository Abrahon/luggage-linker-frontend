


"use client";

;
import TravelerEarningsAnalytics from "./TravelerEarningsAnalytics"; 
import { toast } from "sonner";



export const Earnings = () => {
  return (
    <div className="w-full min-h-screen bg-gray-50/30 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <TravelerEarningsAnalytics />
    </div>
  );
};
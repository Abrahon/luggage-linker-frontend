


"use client";

;
import TravelerEarningsAnalytics from "./TravelerEarningsAnalytics"; 
import { toast } from "sonner";



export const Earnings = () => {
  return (
    <div className="flex flex-col gap-10 md:px-8 px-4 py-12 w-full font-sans bg-gray-50/30 min-h-screen">


      <TravelerEarningsAnalytics />

    </div>
  );
};
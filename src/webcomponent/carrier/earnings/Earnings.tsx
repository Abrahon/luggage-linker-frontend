// 'use client';
// import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
// import { EarningCard } from "./EarningCard";
// import { TripEarnigsTable } from "./TripEarnigsTable";
// import { WithdrawHistoryTable } from "./WithdrawHistoryTable";
// import { Clock, DollarSign, Wallet } from "lucide-react";
// import { toast } from "sonner";

// const earningData = [
//     {
//       icon: <Wallet className="w-5 h-5 text-blue-600" />,
//       title: "Total Earnings",
//       money: "$140.40",
//       text: "All-time income from trips",
//     },
//     {
//       icon: <Clock className="w-5 h-5 text-yellow-500" />,
//       title: "Pending Earnings",
//       money: "$20.40",
//       text: "Earnings yet to be processed",
//     },
//     {
//       icon: <DollarSign className="w-5 h-5 text-green-600" />,
//       title: "Available Balance",
//       money: "$120.00",
//       text: "Ready for withdrawal",
//       actionText: "Withdraw Now",
//       onAction: () => toast.success("Withdrawn successfully!"),
//     },
//   ];

// export const Earnings = () => {
//   return (
//     <div className="flex flex-col gap-8 md:px-6 px-4 py-16">
//       <div className="flex flex-col gap-4">
//         <HeadingSection
//           heading="My Earnings"
//           subheading="Track how much you’ve earned from completed & manage your available balance."
//         />
//         <EarningCard data={earningData}/>
//       </div>

//       {/* Earnings content can be added here */}
//       <div className="flex flex-col gap-4">
//         <HeadingSection
//           heading="Trip based earnings"
//           subheading="Detailed breakdown of earnings from each trip"
//         />
//         <TripEarnigsTable />
//       </div>
//          <div className="flex flex-col gap-4">
//         <HeadingSection
//           heading="Withdraw History"
//           subheading="Your past withdrawal transactions"
//         />
//         <WithdrawHistoryTable />
//       </div>
//     </div>
//   );
// };


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
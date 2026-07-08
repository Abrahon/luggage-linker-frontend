// "use client";

// import { useState } from "react";
// import { DelivaryData } from "@/interface/DelivaryData";
// import { deliveryData } from "@/lib/delivarydata";
// import { AcceptDeliveryDialog } from "../delivaries/AcceptDeliveryDialog";
// import { CompleteDilog } from "../delivaries/CompleteDilog";
// import { statusStyles } from "@/lib/statusColor";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";

// export const TripEarnigsTable = () => {
//   const [openDialog, setOpenDialog] = useState(false);
//   const [selectedDelivery, setSelectedDelivery] = useState<DelivaryData | null>(
//     null
//   );

//   const handleView = (delivery: DelivaryData) => {
//     setSelectedDelivery(delivery);
//     setOpenDialog(true);
//   };

//   // Filter completed, pending, or in-progress (if needed)
//   const allDeliveries = deliveryData;

//   return (
//     <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
//       <div className="overflow-x-auto max-md:max-w-[85vw]">
//         <Table className=" bg-white overflow-x-auto">
//           <TableHeader>
//             <TableRow className="rounded-tl-md">
//               <TableHead className="border-y border-l text-gray-800 font-semibold ">
//                 Route
//               </TableHead>
//               <TableHead className="border-y text-gray-800 font-semibold">
//                 Luggage Weight
//               </TableHead>
//               <TableHead className="border-y text-gray-800 font-semibold">
//                 Rate (kg)
//               </TableHead>
//               <TableHead className="border-y text-gray-800 font-semibold">
//                 Status
//               </TableHead>
//               <TableHead className="border-y border-r text-gray-800 font-semibold text-center">
//                 Action
//               </TableHead>
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {allDeliveries.map((delivery) => {
//               const style = statusStyles[delivery.status];

//               return (
//                 <TableRow key={delivery.delivaryId} className="border-t">
//                   {/* Route */}
//                   <TableCell className="border-y border-l align-top py-3">
//                     <div className="flex flex-col">
//                       <span className="font-semibold text-gray-900">
//                         {delivery.tripData.from} → {delivery.tripData.to}
//                       </span>
//                       <span className="text-sm text-gray-500 mt-1">
//                         {typeof delivery.tripData.date === "string" &&
//                           delivery.tripData.date}
//                       </span>
//                     </div>
//                   </TableCell>

//                   {/* Luggage Weight */}
//                   <TableCell className="border-y align-top py-3">
//                     {delivery.tripData.carryWeight} kg
//                   </TableCell>

//                   {/* Rate */}
//                   <TableCell className="border-y align-top py-3">
//                     ${delivery.tripData.price}
//                   </TableCell>

//                   {/* Status */}
//                   <TableCell className="border-y align-top py-3">
//                     <div
//                       className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${style.bg} ${style.text}`}
//                     >
//                       {style.label}
//                     </div>
//                   </TableCell>

//                   {/* Action */}
//                   <TableCell className="border-y text-center border-r py-3">
//                     <Button
//                       variant="outline"
//                       onClick={() => handleView(delivery)}
//                     >
//                       View Details
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>

//         {/* ----------- DIALOGS ----------- */}
//         {selectedDelivery && selectedDelivery.status !== "completed" ? (
//           <AcceptDeliveryDialog
//             open={openDialog}
//             setOpen={setOpenDialog}
//             delivery={selectedDelivery}
//             showCheckbox={selectedDelivery.status === "pending"}
//           />
//         ) : (
//           selectedDelivery && (
//             <CompleteDilog
//               open={openDialog}
//               setOpen={setOpenDialog}
//               delivery={selectedDelivery}
//             />
//           )
//         )}
//       </div>
//     </div>
//   );
// };

"use client";

import { useState } from "react";
import { DelivaryData } from "@/interface/DelivaryData";
import { deliveryData } from "@/lib/delivarydata";
import { AcceptDeliveryDialog } from "../delivaries/AcceptDeliveryDialog";
import { CompleteDilog } from "../delivaries/CompleteDilog";
import { statusStyles } from "@/lib/statusColor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlaneTakeoff, Scale, DollarSign, Eye } from "lucide-react";

export const TripEarnigsTable = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DelivaryData | null>(
    null
  );

  const handleView = (delivery: DelivaryData) => {
    setSelectedDelivery(delivery);
    setOpenDialog(true);
  };

  const allDeliveries = deliveryData;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto max-md:max-w-[85vw]">
        <Table className="bg-white">
          <TableHeader className="bg-gray-50/70 border-b border-gray-100">
            <TableRow>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4 pl-5">
                Route Parameters
              </TableHead>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">
                Luggage Weight
              </TableHead>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">
                Rate Space Cost
              </TableHead>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4">
                Status
              </TableHead>
              <TableHead className="text-xs font-bold text-gray-500 uppercase tracking-wider py-4 pr-5 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {allDeliveries.map((delivery) => {
              const style = statusStyles[delivery.status];

              return (
                <TableRow 
                  key={delivery.delivaryId} 
                  className="hover:bg-gray-50/40 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  {/* Route Mapping Column */}
                  <TableCell className="align-middle py-4 pl-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 text-slate-500 rounded-xl hidden sm:block border border-slate-100/50">
                        <PlaneTakeoff className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900 font-mono tracking-wide">
                          {delivery.tripData.from} → {delivery.tripData.to}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400 mt-0.5">
                          {typeof delivery.tripData.date === "string" && delivery.tripData.date}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Luggage Weight Column */}
                  <TableCell className="align-middle py-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                      <Scale className="w-3.5 h-3.5 text-gray-400" />
                      <span>{delivery.tripData.carryWeight} kg</span>
                    </div>
                  </TableCell>

                  {/* Rate Cost Column */}
                  <TableCell className="align-middle py-4">
                    <div className="flex items-center gap-0.5 text-xs font-extrabold text-slate-900">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 -mr-0.5" />
                      <span>{delivery.tripData.price}</span>
                    </div>
                  </TableCell>

                  {/* Status Badges Column */}
                  <TableCell className="align-middle py-4">
                    <div
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide w-fit border shadow-sm uppercase ${style.bg} ${style.text}`}
                      style={{ borderColor: "rgba(0,0,0,0.02)" }}
                    >
                      {style.label}
                    </div>
                  </TableCell>

                  {/* Enhanced Interactive Action Button */}
                  <TableCell className="align-middle py-4 pr-5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold px-3 h-8 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 rounded-lg transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                      onClick={() => handleView(delivery)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* ----------- DIALOGS MAPPING OVERLAYS ----------- */}
        {selectedDelivery && selectedDelivery.status !== "completed" ? (
          <AcceptDeliveryDialog
            open={openDialog}
            setOpen={setOpenDialog}
            delivery={selectedDelivery}
            showCheckbox={selectedDelivery.status === "pending"}
          />
        ) : (
          selectedDelivery && (
            <CompleteDilog
              open={openDialog}
              setOpen={setOpenDialog}
              delivery={selectedDelivery}
            />
          )
        )}
      </div>
    </div>
  );
};
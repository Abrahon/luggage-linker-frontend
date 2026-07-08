

// "use client";

// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogTrigger,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { useState } from "react";

// export interface CardItem {
//   icon: React.ReactNode;
//   title: string;
//   money: string;
//   text: string;
//   actionText?: string; // e.g. "Withdraw Now" or "Transfer"
//   onAction?: () => void; // callback when clicked
// }

// interface EarningCardProps {
//   data: CardItem[];
// }

// export const EarningCard: React.FC<EarningCardProps> = ({ data }) => {
//   const [openIndex, setOpenIndex] = useState<number | null>(null);

//   const handleAction = (item: CardItem, index: number) => {
//     if (item.onAction) item.onAction();
//     setOpenIndex(null);
//   };

//   return (
//     <div className="flex flex-col md:flex-row gap-4 w-full">
//       {data.map((item, index) => (
//         <div
//           key={index}
//           className="flex flex-col justify-between border rounded-2xl p-4 shadow-sm w-full md:w-1/3 hover:shadow-md transition-all"
//         >
//           {/* Top Section */}
//           <div className="flex items-center gap-2">
//             <div className="p-2 bg-gray-100 rounded-full">{item.icon}</div>
//             <h3 className="font-semibold text-gray-800">{item.title}</h3>
//           </div>

//           {/* Money */}
//           <div className="mt-3 text-2xl font-bold text-gray-900">
//             {item.money}
//           </div>

//           {/* Description */}
//           <p className="text-sm text-gray-600 mt-1">{item.text}</p>

//           {/* Optional Action Button */}
//           {item.actionText && (
//             <Dialog open={openIndex === index} onOpenChange={(open) => setOpenIndex(open ? index : null)}>
//               <DialogTrigger asChild>
//                 <Button className="mt-4 mx-auto">{item.actionText}</Button>
//               </DialogTrigger>

//               <DialogContent className="sm:max-w-[380px] font-montserrat">
//                 <DialogHeader>
//                   <DialogTitle>Confirm Action</DialogTitle>
//                   <DialogDescription>
//                     Are you sure you want to perform this action for{" "}
//                     <span className="font-semibold text-gray-900">{item.money}</span>?
//                   </DialogDescription>
//                 </DialogHeader>
//                 <DialogFooter className="flex justify-end gap-2">
//                   <DialogClose asChild>
//                     <Button variant="outline">No</Button>
//                   </DialogClose>
//                   <Button onClick={() => handleAction(item, index)}>Yes</Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };


"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";

export interface CardItem {
  icon: React.ReactNode;
  title: string;
  money: string;
  text: string;
  actionText?: string;
  onAction?: () => void;
}

interface EarningCardProps {
  data: CardItem[];
}

export const EarningCard: React.FC<EarningCardProps> = ({ data }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleAction = (item: CardItem) => {
    if (item.onAction) item.onAction();
    setOpenIndex(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {data.map((item, index) => (
        <div
          key={index}
          className="flex flex-col justify-between border border-gray-100 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
        >
          <div>
            {/* Top Section */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100/60 text-gray-600">
                {item.icon}
              </div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {item.title}
              </h3>
            </div>

            {/* Money Value Display */}
            <div className="mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
              {item.money}
            </div>

            {/* Description Paragraph */}
            <p className="text-xs text-gray-500 font-medium mt-1.5">{item.text}</p>
          </div>

          {/* Optional Direct Context Action Button */}
          {item.actionText && (
            <div className="mt-5 pt-4 border-t border-gray-50">
              <Dialog 
                open={openIndex === index} 
                onOpenChange={(open) => setOpenIndex(open ? index : null)}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 h-9 rounded-lg transition-colors shadow-sm">
                    {item.actionText}
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[400px] bg-white rounded-2xl p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                      Confirm Withdrawal Request
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-1">
                      Are you sure you want to transfer your available balance of{" "}
                      <span className="font-bold text-blue-600">{item.money}</span> securely into your linked payout method?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex justify-end gap-2 mt-4">
                    <DialogClose asChild>
                      <Button variant="outline" className="border-gray-200 text-xs font-semibold h-9 rounded-lg">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button 
                      onClick={() => handleAction(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9 rounded-lg"
                    >
                      Confirm Payout
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
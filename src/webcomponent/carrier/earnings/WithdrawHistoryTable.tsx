"use client";

import { Wallet } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 🔹 Interface
interface WithdrawHistory {
  id: number;
  date: string;
  method: "PayPal" | "Bank Transfer";
  amount: string;
  status: "Successful" | "Processing" | "Completed";
}

// 🔹 Dummy Data
const withdrawHistoryData: WithdrawHistory[] = [
  {
    id: 1,
    date: "2025-11-01",
    method: "PayPal",
    amount: "$120",
    status: "Successful",
  },
  {
    id: 2,
    date: "2025-11-04",
    method: "Bank Transfer",
    amount: "$300",
    status: "Processing",
  },
  {
    id: 3,
    date: "2025-11-06",
    method: "PayPal",
    amount: "$90",
    status: "Completed",
  },
];

// 🔹 Status Colors
const statusStyles: Record<
  WithdrawHistory["status"],
  { bg: string; text: string }
> = {
  Successful: { bg: "bg-green-100", text: "text-green-700" },
  Processing: { bg: "bg-yellow-100", text: "text-yellow-700" },
  Completed: { bg: "bg-blue-100", text: "text-blue-700" },
};

// 🔹 Component
export const WithdrawHistoryTable = () => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto max-md:max-w-[85vw]">
        <Table className="bg-white  rounded-tr-lg w-full border border-gray-200">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-800 border-b ">
                Date
              </TableHead>
              <TableHead className="font-semibold text-gray-800 border-b">
                Method
              </TableHead>
              <TableHead className="font-semibold text-gray-800 border-b">
                Amount
              </TableHead>
              {/* <TableHead className="font-semibold text-gray-800 border-b">
                Status
              </TableHead> */}
            </TableRow>
          </TableHeader>

          <TableBody>
            {withdrawHistoryData.map((item) => {
              const style = statusStyles[item.status];
              return (
                <TableRow key={item.id} className="border-b">
                  {/* Date */}
                  <TableCell className="py-3">{item.date}</TableCell>

                  {/* Method */}
                  <TableCell className="flex items-center gap-2 py-3">
                    <Wallet className="w-4 h-4 text-gray-600" />
                    <span>{item.method}</span>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="py-3 font-medium">
                    {item.amount}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${style.bg} ${style.text}`}
                    >
                      {item.status}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

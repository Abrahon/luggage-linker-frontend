"use client";

import { useState } from "react";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// This import path maps straight to your newly created custom primitive file
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} 
from  "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Eye, MoreHorizontal, ShieldCheck, Undo2, FileText } from "lucide-react";

// Interface
export interface Payments {
  paymentId: string;
  bookingId: string;
  senderName: string;
  travelerName: string;
  amount: number;
  platformFee: number;
  escrowStatus: "Held" | "Released" | "Refunded" | "Pending";
  date: string;
}

// Dummy Data
const initialPayments: Payments[] = [
  {
    paymentId: "PAY001",
    bookingId: "BKO-9921",
    senderName: "John Doe",
    travelerName: "Mehedy Hasan",
    amount: 250,
    platformFee: 10,
    date: "2025-10-12",
    escrowStatus: "Released",
  },
  {
    paymentId: "PAY002",
    bookingId: "BKO-4821",
    senderName: "Nusrat Jahan",
    travelerName: "Rakibul Islam",
    amount: 320,
    platformFee: 15,
    date: "2025-10-10",
    escrowStatus: "Held",
  },
  {
    paymentId: "PAY003",
    bookingId: "BKO-1029",
    senderName: "Tania Akter",
    travelerName: "Arif Rahman",
    amount: 500,
    platformFee: 20,
    date: "2025-09-25",
    escrowStatus: "Released",
  },
  {
    paymentId: "PAY004",
    bookingId: "BKO-7734",
    senderName: "Sabbir Ahmed",
    travelerName: "Jahidul Karim",
    amount: 150,
    platformFee: 5,
    date: "2025-09-20",
    escrowStatus: "Pending",
  },
  {
    paymentId: "PAY005",
    bookingId: "BKO-3011",
    senderName: "Mahmudul Hasan",
    travelerName: "Sharmin Akter",
    amount: 420,
    platformFee: 12,
    date: "2025-09-15",
    escrowStatus: "Refunded",
  },
];

export const Payment = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Held" | "Released" | "Refunded" | "Pending">("all");
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payments | null>(null);
  const rowsPerPage = 5;

  // Filter logic
  const filteredPayments = initialPayments.filter((p) => {
    const matchesSearch =
      p.travelerName.toLowerCase().includes(search.toLowerCase()) ||
      p.senderName.toLowerCase().includes(search.toLowerCase()) ||
      p.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      p.paymentId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.escrowStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPayments.length / rowsPerPage);
  const paginatedData = filteredPayments.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  // Placeholder action alert handlers
  const handleReleaseEscrow = (paymentId: string) => {
    alert(`Funds released completely for transaction: ${paymentId}`);
  };

  const handleRefund = (paymentId: string) => {
    alert(`Refund processed successfully for transaction: ${paymentId}`);
  };

  const handleViewInvoice = (paymentId: string) => {
    alert(`Generating system billing invoice view for transaction: ${paymentId}`);
  };

  return (
    <div className="flex flex-col gap-8 py-16 md:px-6 px-4 max-w-7xl mx-auto w-full">
      <HeadingSection
        heading="Payment Management"
        subheading="Monitor system transactions, platform revenue, and secure escrow accounts"
      />

      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Transactions", value: "$245,320", color: "border-l-blue-500" },
          { label: "Escrow Balance", value: "$65,420", color: "border-l-indigo-500" },
          { label: "Pending Escrow", value: "$12,340", color: "border-l-amber-500" },
          { label: "Released Escrow", value: "$52,980", color: "border-l-emerald-500" },
          { label: "Refund Amount", value: "$2,430", color: "border-l-rose-500" },
          { label: "Platform Revenue", value: "$15,620", color: "border-l-purple-500" },
        ].map((card, idx) => (
          <div key={idx} className={cn("bg-white p-4 rounded-xl border border-gray-100 shadow-sm border-l-4", card.color)}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        <div className="relative w-full md:w-1/3">
          <Input
            placeholder="Search by name, ID, or Booking ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v: typeof statusFilter) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full md:w-[180px] bg-white">
            <SelectValue placeholder="All Escrow Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Held">Held</SelectItem>
            <SelectItem value="Released">Released</SelectItem>
            <SelectItem value="Refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Data Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-visible">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Payment ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Booking ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Sender</TableHead>
              <TableHead className="font-semibold text-gray-700">Traveler</TableHead>
              <TableHead className="font-semibold text-gray-700">Amount</TableHead>
              <TableHead className="font-semibold text-gray-700">Platform Fee</TableHead>
              <TableHead className="font-semibold text-gray-700">Escrow Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Date</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((p, index) => (
                <TableRow key={index} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-medium text-gray-900">{p.paymentId}</TableCell>
                  <TableCell className="text-gray-600 font-mono text-xs">{p.bookingId}</TableCell>
                  <TableCell className="text-gray-700">{p.senderName}</TableCell>
                  <TableCell className="text-gray-700">{p.travelerName}</TableCell>
                  <TableCell className="font-medium text-gray-900">${p.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-emerald-600 font-medium">${p.platformFee.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-full tracking-wide inline-block",
                        p.escrowStatus === "Released" && "bg-green-100 text-green-800",
                        p.escrowStatus === "Held" && "bg-indigo-100 text-indigo-800",
                        p.escrowStatus === "Pending" && "bg-amber-100 text-amber-800",
                        p.escrowStatus === "Refunded" && "bg-rose-100 text-rose-800"
                      )}
                    >
                      {p.escrowStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">{p.date}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white shadow-md rounded-lg border border-gray-100 z-50">
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-gray-700 px-3 py-2 hover:bg-gray-50" onClick={() => setSelectedPayment(p)}>
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>View Payment</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="cursor-pointer flex items-center gap-2 text-gray-700 px-3 py-2 hover:bg-gray-50 data-[disabled]:opacity-40"
                          disabled={p.escrowStatus !== "Held" && p.escrowStatus !== "Pending"}
                          onClick={() => handleReleaseEscrow(p.paymentId)}
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span>Release Escrow</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          className="cursor-pointer flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 data-[disabled]:opacity-40"
                          disabled={p.escrowStatus !== "Held" && p.escrowStatus !== "Pending"}
                          onClick={() => handleRefund(p.paymentId)}
                        >
                          <Undo2 className="w-4 h-4 text-rose-400" />
                          <span>Refund</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="bg-gray-100" />
                        
                        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-gray-700 px-3 py-2 hover:bg-gray-50" onClick={() => handleViewInvoice(p.paymentId)}>
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>View Invoice</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No matching payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-md w-full bg-white font-sans">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Transaction Summary</DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="mt-4 flex flex-col gap-3 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between border-b pb-2 border-gray-200/60">
                <span className="text-gray-500">Payment ID:</span>
                <span className="font-semibold text-gray-900">{selectedPayment.paymentId}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-200/60">
                <span className="text-gray-500">Booking Reference:</span>
                <span className="font-mono text-xs font-semibold text-gray-900">{selectedPayment.bookingId}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-200/60">
                <span className="text-gray-500">Sender:</span>
                <span className="text-gray-900">{selectedPayment.senderName}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-200/60">
                <span className="text-gray-500">Traveler:</span>
                <span className="text-gray-900">{selectedPayment.travelerName}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-200/60">
                <span className="text-gray-500">Net Amount:</span>
                <span className="font-bold text-gray-900">${selectedPayment.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-200/60">
                <span className="text-gray-500">Platform Cut Fee:</span>
                <span className="text-emerald-600 font-semibold">${selectedPayment.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-200/60">
                <span className="text-gray-500">Settled On:</span>
                <span className="text-gray-700">{selectedPayment.date}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Current Status:</span>
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-bold rounded-full",
                    selectedPayment.escrowStatus === "Released" && "bg-green-100 text-green-800",
                    selectedPayment.escrowStatus === "Held" && "bg-indigo-100 text-indigo-800",
                    selectedPayment.escrowStatus === "Pending" && "bg-amber-100 text-amber-800",
                    selectedPayment.escrowStatus === "Refunded" && "bg-rose-100 text-rose-800"
                  )}
                >
                  {selectedPayment.escrowStatus}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            {selectedPayment?.escrowStatus === "Held" || selectedPayment?.escrowStatus === "Pending" ? (
              <div className="flex gap-2 w-full justify-end">
                <Button 
                  variant="outline" 
                  className="text-rose-600 border-rose-200 hover:bg-rose-50" 
                  onClick={() => {
                    handleRefund(selectedPayment.paymentId);
                    setSelectedPayment(null);
                  }}
                >
                  Issue Refund
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                  onClick={() => {
                    handleReleaseEscrow(selectedPayment.paymentId);
                    setSelectedPayment(null);
                  }}
                >
                  Release Funds
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setSelectedPayment(null)}>
                Close Record
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Eye, MoreHorizontal, FileText, Loader2 } from "lucide-react";
import {
  getAdminPaymentStatsApi,
  getAdminPaymentsApi,
  BackendPaymentStats,
  BackendPaymentItem,
} from "@/api/payments.api";

export interface PaymentItem {
  paymentId: string;
  bookingId: string;
  senderName: string;
  travelerName: string;
  amount: number;
  platformFee: number;
  escrowStatus: string;
  rawStatus: string;
  date: string;
}

// Status options array with "all" value (fixes Radix UI crash)
const paymentStatusOptions = [
  { label: "All", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Initialized", value: "INITIALIZED" },
  { label: "In Escrow", value: "AUTHORIZED" },
  { label: "Released", value: "CAPTURED" },
  { label: "Refunded", value: "REFUNDED" },
  { label: "Failed", value: "FAILED" },
];

const getStatusLabel = (rawStatus: string) => {
  const match = paymentStatusOptions.find(
    (opt) => opt.value === rawStatus?.toUpperCase()
  );
  return match ? match.label : rawStatus;
};

export const Payment = () => {
  const [stats, setStats] = useState<BackendPaymentStats | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);

  const PAGE_SIZE = 10;

  const fetchStats = async () => {
    try {
      const data = await getAdminPaymentStatsApi();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch payment stats:", err);
    }
  };

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminPaymentsApi({
        search,
        status: statusFilter,
        page,
      });

      const formattedResults: PaymentItem[] = (data.results || []).map((item: BackendPaymentItem) => ({
        paymentId: item.id,
        bookingId: item.booking_id,
        senderName: item.sender,
        travelerName: item.traveler,
        amount: parseFloat(item.amount) || 0,
        platformFee: parseFloat(item.platform_fee) || 0,
        escrowStatus: getStatusLabel(item.escrow_status),
        rawStatus: item.escrow_status,
        date: new Date(item.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      }));

      setPayments(formattedResults);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPayments]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const handleViewInvoice = (paymentId: string) => {
    alert(`Generating system billing invoice view for transaction: ${paymentId}`);
  };

  const formatCurrency = (val?: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return `$${(num || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex flex-col gap-8 py-16 md:px-6 px-4 max-w-7xl mx-auto w-full">
      <HeadingSection
        heading="Payment Management"
        subheading="Monitor system transactions, platform revenue, and secure escrow accounts"
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Transactions", value: stats?.total_transactions ?? 0, color: "border-l-blue-500" },
          { label: "Escrow Balance", value: formatCurrency(stats?.escrow_balance), color: "border-l-indigo-500" },
          { label: "Pending Escrow", value: formatCurrency(stats?.pending_escrow), color: "border-l-amber-500" },
          { label: "Released Escrow", value: formatCurrency(stats?.released_escrow), color: "border-l-emerald-500" },
          { label: "Refund Amount", value: formatCurrency(stats?.refund_amount), color: "border-l-rose-500" },
          { label: "Platform Revenue", value: formatCurrency(stats?.platform_revenue), color: "border-l-purple-500" },
        ].map((card, idx) => (
          <div key={idx} className={cn("bg-white p-4 rounded-xl border border-gray-100 shadow-sm border-l-4", card.color)}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Select Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        <div className="relative w-full md:w-1/3">
          <Input
            placeholder="Search by email or Booking ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full md:w-[180px] bg-white">
            <SelectValue placeholder="All Escrow Status" />
          </SelectTrigger>
          <SelectContent>
            {paymentStatusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    <span>Loading payment transactions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : payments.length > 0 ? (
              payments.map((p) => (
                <TableRow key={p.paymentId} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-medium text-gray-900 font-mono text-xs" title={p.paymentId}>
                    {p.paymentId.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-gray-600 font-mono text-xs" title={p.bookingId}>
                    {p.bookingId.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-gray-700 max-w-[150px] truncate" title={p.senderName}>
                    {p.senderName}
                  </TableCell>
                  <TableCell className="text-gray-700 max-w-[150px] truncate" title={p.travelerName}>
                    {p.travelerName}
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">${p.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-emerald-600 font-medium">${p.platformFee.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-full tracking-wide inline-block",
                        p.rawStatus === "CAPTURED" && "bg-green-100 text-green-800",
                        p.rawStatus === "AUTHORIZED" && "bg-indigo-100 text-indigo-800",
                        p.rawStatus === "PENDING" && "bg-amber-100 text-amber-800",
                        p.rawStatus === "REFUNDED" && "bg-rose-100 text-rose-800",
                        p.rawStatus === "FAILED" && "bg-red-100 text-red-800",
                        p.rawStatus === "INITIALIZED" && "bg-blue-100 text-blue-800"
                      )}
                    >
                      {p.escrowStatus}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm whitespace-nowrap">{p.date}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white shadow-md rounded-lg border border-gray-100 z-50">
                        <DropdownMenuItem 
                          className="cursor-pointer flex items-center gap-2 text-gray-700 px-3 py-2 hover:bg-gray-50" 
                          onClick={() => setSelectedPayment(p)}
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>View Payment</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="bg-gray-100" />
                        
                        <DropdownMenuItem 
                          className="cursor-pointer flex items-center gap-2 text-gray-700 px-3 py-2 hover:bg-gray-50" 
                          onClick={() => handleViewInvoice(p.paymentId)}
                        >
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
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
                <span className="font-semibold text-gray-900 font-mono text-xs">{selectedPayment.paymentId}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-200/60">
                <span className="text-gray-500">Booking Reference:</span>
                <span className="font-mono text-xs font-semibold text-gray-900">{selectedPayment.bookingId}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-200/60">
                <span className="text-gray-500">Sender:</span>
                <span className="text-gray-900 font-medium">{selectedPayment.senderName}</span>
              </div>
              <div className="flex justify-between border-b pb-2 border-gray-200/60">
                <span className="text-gray-500">Traveler:</span>
                <span className="text-gray-900 font-medium">{selectedPayment.travelerName}</span>
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
                <span className="text-gray-500">Created On:</span>
                <span className="text-gray-700">{selectedPayment.date}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-500">Current Status:</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gray-200 text-gray-800">
                  {selectedPayment.escrowStatus} ({selectedPayment.rawStatus})
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" className="w-full" onClick={() => setSelectedPayment(null)}>
              Close Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
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
import { Eye, MoreHorizontal, ShieldCheck, Undo2, FileText, Loader2 } from "lucide-react";
import {
  getAdminPaymentStatsApi,
  getAdminPaymentsApi,
  releaseEscrowApi,
  refundEscrowApi,
  BackendPaymentStats,
  BackendPaymentItem,
} from "@/api/payments.api"; // Adjust import path as needed

// UI Display Model
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

// Maps backend status strings to frontend labels & badges
const mapEscrowStatus = (status: string) => {
  switch (status.toUpperCase()) {
    case "AUTHORIZED":
      return "Pending";
    case "CAPTURED":
      return "Held";
    case "RELEASED":
      return "Released";
    case "REFUNDED":
      return "Refunded";
    default:
      return status;
  }
};

export const Payment = () => {
  // State management
  const [stats, setStats] = useState<BackendPaymentStats | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);

  const PAGE_SIZE = 10;

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const data = await getAdminPaymentStatsApi();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch payment stats:", err);
    }
  };

  // Fetch Payments List
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminPaymentsApi({
        search,
        escrow_status: statusFilter,
        page,
      });

      const formattedResults: PaymentItem[] = data.results.map((item: BackendPaymentItem) => ({
        paymentId: item.id,
        bookingId: item.booking_id,
        senderName: item.sender,
        travelerName: item.traveler,
        amount: parseFloat(item.amount) || 0,
        platformFee: parseFloat(item.platform_fee) || 0,
        escrowStatus: mapEscrowStatus(item.escrow_status),
        rawStatus: item.escrow_status,
        date: new Date(item.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      }));

      setPayments(formattedResults);
      setTotalCount(data.count);
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
    }, 300); // Debounce search calls
    return () => clearTimeout(timer);
  }, [fetchPayments]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  // Actions
  const handleReleaseEscrow = async (paymentId: string) => {
    try {
      setActionLoading(true);
      await releaseEscrowApi(paymentId);
      alert(`Funds released completely for transaction: ${paymentId}`);
      setSelectedPayment(null);
      fetchPayments();
      fetchStats();
    } catch (err) {
      console.error("Failed to release escrow:", err);
      alert("Error releasing funds. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async (paymentId: string) => {
    try {
      setActionLoading(true);
      await refundEscrowApi(paymentId);
      alert(`Refund processed successfully for transaction: ${paymentId}`);
      setSelectedPayment(null);
      fetchPayments();
      fetchStats();
    } catch (err) {
      console.error("Failed to refund escrow:", err);
      alert("Error processing refund. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

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

      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Transactions", value: stats?.total_transactions ?? 0, isRaw: true, color: "border-l-blue-500" },
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

      {/* Filters Row */}
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
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full md:w-[180px] bg-white">
            <SelectValue placeholder="All Escrow Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="AUTHORIZED">Pending (Authorized)</SelectItem>
            <SelectItem value="CAPTURED">Held (Captured)</SelectItem>
            <SelectItem value="RELEASED">Released</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payment Data Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-visible">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Payment ID</TableHead>
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
                        p.escrowStatus === "Released" && "bg-green-100 text-green-800",
                        p.escrowStatus === "Held" && "bg-indigo-100 text-indigo-800",
                        p.escrowStatus === "Pending" && "bg-amber-100 text-amber-800",
                        p.escrowStatus === "Refunded" && "bg-rose-100 text-rose-800"
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
                <span
                  className={cn(
                    "px-2 py-0.5 text-xs font-bold rounded-full",
                    selectedPayment.escrowStatus === "Released" && "bg-green-100 text-green-800",
                    selectedPayment.escrowStatus === "Held" && "bg-indigo-100 text-indigo-800",
                    selectedPayment.escrowStatus === "Pending" && "bg-amber-100 text-amber-800",
                    selectedPayment.escrowStatus === "Refunded" && "bg-rose-100 text-rose-800"
                  )}
                >
                  {selectedPayment.escrowStatus} ({selectedPayment.rawStatus})
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            {selectedPayment?.escrowStatus === "Held" || selectedPayment?.escrowStatus === "Pending" ? (
              <div className="flex gap-2 w-full justify-end">
                <Button 
                  variant="outline" 
                  disabled={actionLoading}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50" 
                  onClick={() => handleRefund(selectedPayment.paymentId)}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Issue Refund"}
                </Button>
                <Button 
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                  onClick={() => handleReleaseEscrow(selectedPayment.paymentId)}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Release Funds"}
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
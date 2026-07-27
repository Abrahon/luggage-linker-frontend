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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Eye, MoreHorizontal, Loader2, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import {
  WalletApi,
  WithdrawalListItem,
  WithdrawalDetailResponse,
  AdminWithdrawalStats,
} from "@/api/wallet.api";

export const Wallet = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalListItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Statistics State
  const [stats, setStats] = useState<AdminWithdrawalStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Filters & Pagination
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 10;

  // Detail Modal & Action States
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);
  const [withdrawalDetail, setWithdrawalDetail] = useState<WithdrawalDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Action States (Approve / Reject)
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showRejectInput, setShowRejectInput] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await WalletApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawal statistics:", error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch List Data
  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await WalletApi.getWithdrawals({
        page,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setWithdrawals(data.results);
      setTotalCount(data.count);
    } catch (error) {
      console.error("Failed to fetch withdrawals:", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleRefreshAll = () => {
    fetchStats();
    fetchWithdrawals();
  };

  // View Details Handler
  const handleViewDetails = async (id: string) => {
    setSelectedWithdrawalId(id);
    setIsDetailOpen(true);
    setLoadingDetail(true);
    setShowRejectInput(false);
    setRejectionReason("");
    setActionError(null);
    try {
      const data = await WalletApi.getWithdrawalDetail(id);
      setWithdrawalDetail(data);
    } catch (error) {
      console.error("Failed to fetch withdrawal detail:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Approve Action
  const handleApprove = async () => {
    if (!selectedWithdrawalId) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      const res = await WalletApi.approveWithdrawal(selectedWithdrawalId);
      if (res.success) {
        setWithdrawalDetail(res.data);
        handleRefreshAll();
      }
    } catch (error) {
      setActionError("Failed to approve withdrawal request.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reject Action
  const handleReject = async () => {
    if (!selectedWithdrawalId) return;
    if (!rejectionReason.trim()) {
      setActionError("Please enter a rejection reason.");
      return;
    }
    setIsProcessing(true);
    setActionError(null);
    try {
      const res = await WalletApi.rejectWithdrawal(selectedWithdrawalId, rejectionReason.trim());
      if (res.success) {
        setWithdrawalDetail(res.data);
        setShowRejectInput(false);
        setRejectionReason("");
        handleRefreshAll();
      }
    } catch (error) {
      setActionError("Failed to reject withdrawal request.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "PAID":
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800";
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      case "REJECTED":
      case "CANCELLED":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col gap-8 py-12 md:px-6 px-4 max-w-7xl mx-auto w-full">
      <HeadingSection
        heading="Withdrawal Management"
        subheading="Monitor traveler withdrawal requests, verify payout routes, and process pending requests"
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Travelers Requested</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : stats?.total_travelers_requested ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">Unique travelers requested</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pending Balance</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {loadingStats ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              `$${parseFloat(stats?.total_pending_balance || "0.00").toFixed(2)}`
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1">Awaiting admin review</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-indigo-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Requests</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : stats?.pending_requests ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">Requires approval</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Requests</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {loadingStats ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : stats?.completed_requests ?? 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">Successfully processed</p>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mt-2">
        <div className="relative w-full lg:w-1/3">
          <Input
            placeholder="Search Traveler Name or Email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleRefreshAll} title="Refresh Data">
            <RefreshCw className={cn("w-4 h-4", (loading || loadingStats) && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/70">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">Traveler</TableHead>
              <TableHead className="font-semibold text-gray-700">Amount</TableHead>
              <TableHead className="font-semibold text-gray-700">Method</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Requested Date</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span>Loading withdrawal requests...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : withdrawals.length > 0 ? (
              withdrawals.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{item.traveler_name || "N/A"}</span>
                      <span className="text-xs text-gray-400">{item.traveler_email}</span>
                    </div>
                  </TableCell>

                  <TableCell className="font-semibold text-gray-900">
                    ${parseFloat(item.amount).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    <span className="text-xs font-mono font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {item.withdrawal_method || "N/A"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full tracking-wide inline-block", getStatusBadge(item.status))}>
                      {item.status}
                    </span>
                  </TableCell>

                  <TableCell className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white shadow-md rounded-lg border border-gray-100 z-50">
                        <DropdownMenuItem
                          className="cursor-pointer flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => handleViewDetails(item.id)}
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No withdrawal records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">
            Showing {withdrawals.length} of {totalCount} entries
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1 || loading}>
              Previous
            </Button>
            <span className="text-sm text-gray-600 flex items-center px-2">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages || loading}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Details & Approval Dialog Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg w-full bg-white font-sans">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Withdrawal Request Details
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Detailed breakdown of transaction route and payout account details.
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : withdrawalDetail ? (
            <div className="flex flex-col gap-4 my-2 text-sm text-gray-700">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Request ID</span>
                  <span className="font-mono text-xs text-gray-800">{withdrawalDetail.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Amount</span>
                  <span className="font-bold text-emerald-600">${parseFloat(withdrawalDetail.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Status</span>
                  <span className={cn("px-2 py-0.5 text-xs font-semibold rounded-full", getStatusBadge(withdrawalDetail.status))}>
                    {withdrawalDetail.status}
                  </span>
                </div>
                {withdrawalDetail.rejection_reason && (
                  <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                    <span className="text-xs text-rose-500 uppercase font-semibold">Rejection Reason</span>
                    <span className="text-xs text-rose-700 font-medium">{withdrawalDetail.rejection_reason}</span>
                  </div>
                )}
              </div>

              {/* Bank Details Section */}
              {withdrawalDetail.withdrawal_method_details ? (
                <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bank Account Information
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 block">Bank Name</span>
                      <span className="font-medium text-gray-900">{withdrawalDetail.withdrawal_method_details.bank_name || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Account Name</span>
                      <span className="font-medium text-gray-900">{withdrawalDetail.withdrawal_method_details.account_name || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Account Number</span>
                      <span className="font-medium text-gray-900">{withdrawalDetail.withdrawal_method_details.account_number || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Routing Number</span>
                      <span className="font-medium text-gray-900">{withdrawalDetail.withdrawal_method_details.routing_number || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Branch Name</span>
                      <span className="font-medium text-gray-900">{withdrawalDetail.withdrawal_method_details.branch_name || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Verified Status</span>
                      <span className={cn("font-medium", withdrawalDetail.withdrawal_method_details.is_verified ? "text-emerald-600" : "text-amber-600")}>
                        {withdrawalDetail.withdrawal_method_details.is_verified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs">
                  No payout account details attached to this record.
                </div>
              )}

              {/* Error Message */}
              {actionError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                  {actionError}
                </div>
              )}

              {/* Action Buttons for Pending Requests */}
              {withdrawalDetail.status === "PENDING" && (
                <div className="pt-2 border-t border-gray-100 flex flex-col gap-3">
                  {showRejectInput ? (
                    <div className="flex flex-col gap-2 bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                      <label className="text-xs font-semibold text-rose-800">Reason for Rejection *</label>
                      <Input
                        placeholder="e.g. Invalid bank account details"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="bg-white text-xs"
                      />
                      <div className="flex gap-2 justify-end mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRejectInput(false)}
                          disabled={isProcessing}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleReject}
                          disabled={isProcessing}
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Reject"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        className="border-rose-200 text-rose-700 hover:bg-rose-50"
                        onClick={() => setShowRejectInput(true)}
                        disabled={isProcessing}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Reject Request
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={handleApprove}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Approve Request
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500 text-sm">Failed to load details.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
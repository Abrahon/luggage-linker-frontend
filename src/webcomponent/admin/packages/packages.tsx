"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { RiskBadge } from "@/components/ui/risk-badge";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Package as PackageIcon,
  Calendar,
  Weight,
  DollarSign,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAdminPackagesApi,
  getAdminPackageDetailApi,
  reviewAdminPackageApi,
  AdminPackage,
} from "@/api/packages.api";

export const Packages = () => {
  const [packages, setPackages] = useState<AdminPackage[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const rowsPerPage = 10;

  // View Details State
  const [viewingPackage, setViewingPackage] = useState<AdminPackage | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Admin Review Action State
  const [reviewingPackage, setReviewingPackage] = useState<AdminPackage | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Force reset body pointer-events whenever modals change to prevent Radix UI freeze
  useEffect(() => {
    if (!viewingPackage && !reviewingPackage) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "auto";
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewingPackage, reviewingPackage]);

  // Fetch Packages List
  const fetchPackages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getAdminPackagesApi({
        search,
        status: statusFilter,
        verification_status: verificationFilter,
        category: categoryFilter,
        page,
      });

      setPackages(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err: any) {
      console.error("Failed to fetch packages:", err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load packages."
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, verificationFilter, categoryFilter, page]);

  // Debounced search & filter handler
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPackages();
    }, 350);

    return () => clearTimeout(handler);
  }, [fetchPackages]);

  // Handle View Package Details
  const handleViewDetails = async (packageId: string) => {
    try {
      setIsLoadingDetail(true);
      const data = await getAdminPackageDetailApi(packageId);
      setViewingPackage(data);
    } catch (err: any) {
      console.error("Failed to fetch package detail, fallback to local state:", err);
      const fallback = packages.find((p) => p.id === packageId) || null;
      setViewingPackage(fallback);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Handle Approve / Reject Package via PATCH API
  const handleReviewPackage = async (
    targetPackage: AdminPackage | null,
    approve: boolean
  ) => {
    if (!targetPackage) return;

    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      const response = await reviewAdminPackageApi(targetPackage.id, approve);

      // Update package state in local table list
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === targetPackage.id
            ? {
                ...pkg,
                verification_status:
                  response.data?.verification_status ||
                  (approve ? "VERIFIED" : "REJECTED"),
                status:
                  response.data?.status ||
                  (approve ? "PUBLISHED" : pkg.status),
              }
            : pkg
        )
      );

      setSuccessMessage(
        response.message ||
          `Package was successfully ${approve ? "approved & published" : "rejected"}.`
      );
      setReviewingPackage(null);
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      setReviewError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to process review. Please try again."
      );
    } finally {
      setIsSubmittingReview(false);
      document.body.style.pointerEvents = "auto";
    }
  };

  // Helpers for Status Badges
  const getStatusBadge = (status?: string) => {
    const formatted = (status || "").toUpperCase();
    const badges: Record<string, string> = {
      PUBLISHED: "bg-emerald-100 text-emerald-800 border-emerald-200",
      MATCHED: "bg-blue-100 text-blue-800 border-blue-200",
      BOOKED: "bg-purple-100 text-purple-800 border-purple-200",
      IN_TRANSIT: "bg-amber-100 text-amber-800 border-amber-200",
      DELIVERED: "bg-teal-100 text-teal-800 border-teal-200",
      CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
      EXPIRED: "bg-slate-100 text-slate-700 border-slate-200",
      DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      <span
        className={cn(
          "px-2.5 py-1 text-xs font-semibold rounded-full border",
          badges[formatted] || "bg-slate-100 text-slate-700 border-slate-200"
        )}
      >
        {status || "UNKNOWN"}
      </span>
    );
  };

  const getVerificationBadge = (verificationStatus?: string) => {
    const formatted = (verificationStatus || "").toUpperCase();
    if (formatted === "VERIFIED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          <ShieldCheck className="w-3 h-3" /> Verified
        </span>
      );
    }
    if (formatted === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          <ShieldAlert className="w-3 h-3" /> Pending
        </span>
      );
    }
    if (formatted === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
        {verificationStatus || "N/A"}
      </span>
    );
  };

  const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;

  return (
    <div className="flex flex-col gap-6 py-8 md:px-6 px-4 w-full">
      <HeadingSection heading="Package Management" />

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSuccessMessage(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPackages}>
            Retry
          </Button>
        </div>
      )}

      {/* Search & Filter Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="w-full">
          <Input
            placeholder="Search package title or sender email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="MATCHED">Matched</SelectItem>
            <SelectItem value="BOOKED">Booked</SelectItem>
            <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>

        {/* Verification Filter */}
        <Select
          value={verificationFilter}
          onValueChange={(v) => {
            setVerificationFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="All Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verification</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
            <SelectItem value="MANUAL_REVIEW">Manual Review</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="DOCUMENT">Document</SelectItem>
            <SelectItem value="ELECTRONICS">Electronics</SelectItem>
            <SelectItem value="CLOTHING">Clothing</SelectItem>
            <SelectItem value="FOOD">Food</SelectItem>
            <SelectItem value="MEDICINE">Medicine</SelectItem>
            <SelectItem value="COSMETICS">Cosmetics</SelectItem>
            <SelectItem value="BOOKS">Books</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Package Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70">
              <TableHead className="font-semibold text-slate-700">Package</TableHead>
              <TableHead className="font-semibold text-slate-700">Sender</TableHead>
              <TableHead className="font-semibold text-slate-700">Route</TableHead>
              <TableHead className="font-semibold text-slate-700">Weight & Value</TableHead>
              <TableHead className="font-semibold text-slate-700">Risk Level</TableHead>
              <TableHead className="font-semibold text-slate-700">Verification</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-right text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex justify-center items-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                    <span>Loading packages...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : packages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500 py-12">
                  No packages found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              packages.map((pkg) => {
                const primaryImage =
                  pkg.images?.find((img) => img.is_primary)?.image ||
                  pkg.images?.[0]?.image;

                return (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {primaryImage ? (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                            <Image
                              src={primaryImage}
                              alt={pkg.title || "Package image"}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <PackageIcon className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 text-sm">
                            {pkg.title.length > 25 ? `${pkg.title.slice(0, 25)}...` : pkg.title}
                          </span>
                          <span className="text-xs text-slate-500">{pkg.category}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-medium text-slate-800">
                        {pkg.sender_email}
                      </div>
                      <div className="text-xs text-slate-400">
                        {pkg.sender_name?.trim() || "No Name"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-medium text-slate-800">
                        {pkg.pickup_city}, {pkg.pickup_country}
                      </div>
                      <div className="text-xs text-slate-500">
                        → {pkg.destination_city}, {pkg.destination_country}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-slate-800">
                      <div>{pkg.weight} kg</div>
                      <div className="text-xs text-slate-500">
                        {pkg.reward_amount} {pkg.currency}
                      </div>
                    </TableCell>

                    {/* Risk Badge Table Column */}
                    <TableCell>
                      {pkg.risk_score !== undefined && pkg.risk_score !== null ? (
                        <RiskBadge
                          score={
                            pkg.risk_score <= 1
                              ? Math.round(pkg.risk_score * 100)
                              : pkg.risk_score
                          }
                        />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">N/A</span>
                      )}
                    </TableCell>

                    <TableCell>{getVerificationBadge(pkg.verification_status)}</TableCell>

                    <TableCell>{getStatusBadge(pkg.status)}</TableCell>

                    {/* 3-Dot Dropdown Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white min-w-[170px]">
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setTimeout(() => handleViewDetails(pkg.id), 50);
                            }}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                            <span>View Details</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setTimeout(() => setReviewingPackage(pkg), 50);
                            }}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <ShieldCheck className="h-4 w-4 text-indigo-600" />
                            <span>Review Modal</span>
                          </DropdownMenuItem>

                          {pkg.verification_status === "PENDING" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleReviewPackage(pkg, true);
                                }}
                                className="cursor-pointer text-emerald-600 focus:text-emerald-600 flex items-center gap-2"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span>Approve Package</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleReviewPackage(pkg, false);
                                }}
                                className="cursor-pointer text-rose-600 focus:text-rose-600 flex items-center gap-2"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Reject Package</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-slate-500">
            Showing page {page} of {totalPages} ({totalCount} total items)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* VIEW PACKAGE DETAILS DIALOG */}
      <Dialog
        open={!!viewingPackage || isLoadingDetail}
        onOpenChange={(open) => {
          if (!open) {
            setViewingPackage(null);
            document.body.style.pointerEvents = "auto";
          }
        }}
      >
        <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-900">
              <PackageIcon className="h-5 w-5 text-blue-600" />
              Package Details
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span>Fetching package details...</span>
            </div>
          ) : viewingPackage ? (
            <div className="space-y-6 py-2">
              {/* Image Gallery */}
              {viewingPackage.images && viewingPackage.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {viewingPackage.images.map((img) => (
                    <div
                      key={img.id}
                      className="relative w-28 h-28 rounded-lg overflow-hidden border shrink-0 bg-slate-50"
                    >
                      <Image
                        src={img.image}
                        alt="Package thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Title & Status Header */}
              <div className="flex justify-between items-start bg-slate-50 p-4 rounded-xl border">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{viewingPackage.title}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <User className="w-3.5 h-3.5" /> Sender: {viewingPackage.sender_email}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {viewingPackage.risk_score !== undefined &&
                    viewingPackage.risk_score !== null && (
                      <RiskBadge
                        score={
                          viewingPackage.risk_score <= 1
                            ? Math.round(viewingPackage.risk_score * 100)
                            : viewingPackage.risk_score
                        }
                      />
                    )}
                  {getVerificationBadge(viewingPackage.verification_status)}
                  {getStatusBadge(viewingPackage.status)}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border">
                  {viewingPackage.description || "No description provided."}
                </p>
              </div>

              {/* Route Details */}
              <div className="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm">
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Pickup
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">
                    {viewingPackage.pickup_city}, {viewingPackage.pickup_country}
                  </p>
                  <p className="text-xs text-slate-500">{viewingPackage.pickup_address}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-600 uppercase flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Destination
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">
                    {viewingPackage.destination_city}, {viewingPackage.destination_country}
                  </p>
                  <p className="text-xs text-slate-500">{viewingPackage.destination_address}</p>
                </div>
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t pt-4 text-sm">
                <div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Weight className="w-3.5 h-3.5 text-slate-400" /> Weight
                  </span>
                  <span className="font-semibold text-slate-800">{viewingPackage.weight} kg</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Reward
                  </span>
                  <span className="font-semibold text-slate-800">
                    {viewingPackage.reward_amount} {viewingPackage.currency}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Declared Value</span>
                  <span className="font-semibold text-slate-800">
                    {viewingPackage.declared_value} {viewingPackage.currency}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Pickup Date
                  </span>
                  <span className="font-semibold text-slate-800">{viewingPackage.pickup_date}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Latest Delivery
                  </span>
                  <span className="font-semibold text-slate-800">
                    {viewingPackage.latest_delivery_date}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Risk Score</span>
                  {viewingPackage.risk_score !== undefined &&
                  viewingPackage.risk_score !== null ? (
                    <RiskBadge
                      score={
                        viewingPackage.risk_score <= 1
                          ? Math.round(viewingPackage.risk_score * 100)
                          : viewingPackage.risk_score
                      }
                    />
                  ) : (
                    <span className="font-semibold text-slate-800">N/A</span>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter className="pt-3 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setViewingPackage(null);
                document.body.style.pointerEvents = "auto";
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADMIN REVIEW / APPROVAL DIALOG */}
      <Dialog
        open={!!reviewingPackage}
        onOpenChange={(open) => {
          if (!open) {
            setReviewingPackage(null);
            document.body.style.pointerEvents = "auto";
          }
        }}
      >
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Review Package Verification
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-slate-600 mt-2">
            Are you sure you want to verify and publish{" "}
            <strong>"{reviewingPackage?.title}"</strong> submitted by{" "}
            <strong>{reviewingPackage?.sender_email}</strong>?
          </p>

          {reviewError && (
            <p className="text-xs text-rose-600 font-medium mt-2">{reviewError}</p>
          )}

          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setReviewingPackage(null);
                document.body.style.pointerEvents = "auto";
              }}
              disabled={isSubmittingReview}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReviewPackage(reviewingPackage, false)}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? <Loader2 className="animate-spin h-4 w-4" /> : "Reject"}
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleReviewPackage(reviewingPackage, true)}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Approve & Publish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
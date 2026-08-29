
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Package,
  Clock,
  CheckCircle2,
  Wallet,
  AlertCircle,
  RefreshCw,
  CreditCard,
  ArrowRight,
  User,
  Hash,
  Loader2,
  MoveHorizontal,
} from "lucide-react";

import {
  SenderApiService,
  DashboardStats,
  ActionRequiredItem,
  RecentBooking,
} from "@/api/sender.api";

import { PaymentApiService } from "@/api/payment.api";

export const SenderDashboard = () => {
  // =========================================================
  // State Management
  // =========================================================

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [actions, setActions] = useState<ActionRequiredItem[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Track processing payment state per booking
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  // =========================================================
  // Fetch Dashboard Data
  // =========================================================

  const loadDashboardData = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const [statsRes, actionsRes, bookingsRes] = await Promise.all([
        SenderApiService.getStats(),
        SenderApiService.getActionRequired(),
        SenderApiService.getRecentBookings(),
      ]);

      // -----------------------------
      // Stats
      // -----------------------------

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      // -----------------------------
      // Action Required
      // Payment Pending Only
      // -----------------------------

      if (actionsRes.success) {
        const paymentRequiredActions = actionsRes.data.filter(
          (item) =>
            item.action === "PAY_NOW" ||
            item.current_status === "PAYMENT_PENDING"
        );

        setActions(paymentRequiredActions);
      }

      // -----------------------------
      // Recent Bookings
      // -----------------------------

      if (bookingsRes.success) {
        setRecentBookings(bookingsRes.data);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // =========================================================
  // Initial Load
  // =========================================================

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // =========================================================
  // Stripe Payment Initiation
  // =========================================================

  const handlePaymentClick = async (bookingId: string) => {
    try {
      setPayingBookingId(bookingId);
      setError(null);

      const response =
        await PaymentApiService.initiatePayment(bookingId);

      if (response.success && response.data?.checkout_url) {
        // Redirect directly to Stripe Hosted Checkout
        window.location.href = response.data.checkout_url;
      } else {
        setError(
          "Failed to generate checkout session. Please try again."
        );

        setPayingBookingId(null);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to process payment initiation."
      );

      setPayingBookingId(null);
    }
  };

  // =========================================================
  // Status Badge
  // =========================================================

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pending",
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
        };

      case "TRAVELER_ACCEPTED":
        return {
          label: "Accepted",
          className:
            "bg-indigo-50 text-indigo-700 border-indigo-200",
        };

      case "PAYMENT_PENDING":
        return {
          label: "Waiting for Payment",
          className:
            "bg-orange-50 text-orange-700 border-orange-200",
        };

      case "CONFIRMED":
        return {
          label: "Confirmed",
          className:
            "bg-purple-50 text-purple-700 border-purple-200",
        };

      case "PICKED_UP":
        return {
          label: "Picked Up",
          className:
            "bg-sky-50 text-sky-700 border-sky-200",
        };

      case "IN_TRANSIT":
        return {
          label: "In Transit",
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
        };

      case "DELIVERED":
        return {
          label: "Delivered",
          className:
            "bg-teal-50 text-teal-700 border-teal-200",
        };

      case "COMPLETED":
        return {
          label: "Completed",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        };

      case "REJECTED":
        return {
          label: "Rejected",
          className:
            "bg-rose-50 text-rose-700 border-rose-200",
        };

      case "CANCELLED":
        return {
          label: "Cancelled",
          className:
            "bg-slate-100 text-slate-600 border-slate-200",
        };

      default:
        return {
          label: status,
          className:
            "bg-slate-50 text-slate-700 border-slate-200",
        };
    }
  };

  // =========================================================
  // Escrow Badge
  // =========================================================

  const getEscrowBadge = (escrowStatus: string) => {
    switch (escrowStatus) {
      case "HELD":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      case "RELEASED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "REFUNDED":
        return "bg-rose-50 text-rose-700 border-rose-200";

      case "NOT_FUNDED":
      default:
        return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  // =========================================================
  // Render
  // =========================================================

  return (
    <div
      className="
        w-full
        min-h-screen
        bg-slate-50/50
        py-4
        sm:py-6
        lg:py-8
        px-3
        sm:px-6
        lg:px-8
        text-slate-800
        antialiased
        space-y-4
        sm:space-y-6
        lg:space-y-8
        overflow-x-hidden
        min-w-0
      "
    >
      {/* =====================================================
          1. Header
      ====================================================== */}

      <div
        className="
          w-full
          flex
          flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-3
          sm:gap-4
          bg-white
          p-4
          sm:p-6
          rounded-xl
          sm:rounded-2xl
          border
          border-slate-200/80
          shadow-xs
          min-w-0
        "
      >
        <div className="min-w-0">
          <h1
            className="
              text-lg
              sm:text-2xl
              font-bold
              text-slate-900
              tracking-tight
              truncate
            "
          >
            Sender Dashboard
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
            Overview of active shipments and recent package requests.
          </p>
        </div>

        <button
          onClick={() => loadDashboardData(true)}
          disabled={
            isLoading ||
            isRefreshing ||
            payingBookingId !== null
          }
          className="
            w-full
            sm:w-auto
            inline-flex
            items-center
            justify-center
            gap-2
            px-3.5
            sm:px-4
            py-2
            sm:py-2.5
            text-xs
            font-semibold
            text-slate-700
            bg-slate-50
            hover:bg-slate-100
            border
            border-slate-200
            rounded-lg
            sm:rounded-xl
            transition-all
            shadow-xs
            disabled:opacity-50
            shrink-0
          "
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isRefreshing
                ? "animate-spin text-blue-600"
                : ""
            }`}
          />

          <span>
            {isRefreshing ? "Updating..." : "Refresh Data"}
          </span>
        </button>
      </div>

      {/* =====================================================
          Error Banner
      ====================================================== */}

      {error && (
        <div
          className="
            w-full
            p-3.5
            sm:p-4
            bg-rose-50
            border
            border-rose-200
            rounded-xl
            sm:rounded-2xl
            text-rose-800
            text-xs
            sm:text-sm
            flex
            flex-col
            sm:flex-row
            sm:items-center
            justify-between
            gap-2.5
            sm:gap-3
            shadow-xs
          "
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />

            <span className="font-medium break-words sm:truncate">
              {error}
            </span>
          </div>

          <button
            onClick={() => loadDashboardData()}
            className="
              text-xs
              font-semibold
              underline
              hover:text-rose-950
              shrink-0
              self-end
              sm:self-auto
            "
          >
            Try Again
          </button>
        </div>
      )}

      {/* =====================================================
          2. Stats Grid
      ====================================================== */}

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Shipments */}

        <div
          className="
            bg-white
            p-3.5
            sm:p-5
            rounded-xl
            sm:rounded-2xl
            border
            border-slate-200/80
            shadow-xs
            flex
            flex-col
            justify-between
            min-h-[110px]
            sm:min-h-[130px]
          "
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Active Shipments
            </span>

            <div className="p-1.5 sm:p-2.5 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
              {isLoading
                ? "..."
                : stats?.active_bookings ?? 0}
            </span>

            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">
              In transit or picked up
            </p>
          </div>
        </div>

        {/* Pending Acceptance */}

        <div
          className="
            bg-white
            p-3.5
            sm:p-5
            rounded-xl
            sm:rounded-2xl
            border
            border-slate-200/80
            shadow-xs
            flex
            flex-col
            justify-between
            min-h-[110px]
            sm:min-h-[130px]
          "
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Pending Acceptance
            </span>

            <div className="p-1.5 sm:p-2.5 bg-amber-50 text-amber-600 rounded-lg sm:rounded-xl shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
              {isLoading
                ? "..."
                : stats?.pending_bookings ?? 0}
            </span>

            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">
              Awaiting traveler response
            </p>
          </div>
        </div>

        {/* Completed */}

        <div
          className="
            bg-white
            p-3.5
            sm:p-5
            rounded-xl
            sm:rounded-2xl
            border
            border-slate-200/80
            shadow-xs
            flex
            flex-col
            justify-between
            min-h-[110px]
            sm:min-h-[130px]
          "
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Completed
            </span>

            <div className="p-1.5 sm:p-2.5 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
              {isLoading
                ? "..."
                : stats?.completed_bookings ?? 0}
            </span>

            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">
              Successfully delivered
            </p>
          </div>
        </div>

        {/* Total Spent */}

        <div
          className="
            bg-white
            p-3.5
            sm:p-5
            rounded-xl
            sm:rounded-2xl
            border
            border-slate-200/80
            shadow-xs
            flex
            flex-col
            justify-between
            min-h-[110px]
            sm:min-h-[130px]
          "
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              Total Spent
            </span>

            <div className="p-1.5 sm:p-2.5 bg-indigo-50 text-indigo-600 rounded-lg sm:rounded-xl shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
              {isLoading
                ? "..."
                : `$${stats?.total_spent ?? "0.00"}`}
            </span>

            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">
              Total shipping costs
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          3. Action Required
      ====================================================== */}

      {!isLoading && actions.length > 0 && (
        <div className="w-full space-y-2.5 sm:space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Action Required
            </h2>

            <span className="bg-amber-500 text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full">
              {actions.length}
            </span>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {actions.map((item) => {
              const isPayingThis =
                payingBookingId === item.booking_id;

              return (
                <div
                  key={item.booking_id}
                  className="
                    w-full
                    bg-white
                    rounded-xl
                    sm:rounded-[16px]
                    border
                    border-amber-200/80
                    shadow-xs
                    p-3.5
                    sm:p-5
                    flex
                    flex-col
                    justify-between
                    gap-3.5
                    sm:gap-4
                    min-w-0
                  "
                >
                  {/* Header */}

                  <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 shrink-0">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          Payment Required
                        </h3>

                        <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {item.package_title}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold border shrink-0 bg-amber-50 text-amber-700 border-amber-200">
                      Waiting for Payment
                    </span>
                  </div>

                  {/* Metadata */}

                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                      <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                      <span className="font-mono font-bold text-slate-800 truncate">
                        {item.tracking_number}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />

                      <span className="font-medium text-slate-800 truncate">
                        {item.title || "Assigned Traveler"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Traveler accepted your booking. Complete
                    payment to confirm this shipment.
                  </p>

                  {/* CTA */}

                  <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <div className="min-w-0">
                      <span className="block text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Reward
                      </span>

                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 break-words block">
                        {item.reward} {item.currency}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handlePaymentClick(item.booking_id)
                      }
                      disabled={payingBookingId !== null}
                      className="
                        w-full
                        sm:w-auto
                        px-3.5
                        sm:px-5
                        py-2
                        sm:py-2.5
                        rounded-lg
                        sm:rounded-xl
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-white
                        bg-amber-600
                        hover:bg-amber-700
                        active:bg-amber-800
                        transition-all
                        shadow-xs
                        flex
                        items-center
                        justify-center
                        gap-1.5
                        sm:gap-2
                        disabled:opacity-60
                        shrink-0
                      "
                    >
                      {isPayingThis ? (
                        <>
                          <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />

                          <span>Redirecting...</span>
                        </>
                      ) : (
                        <>
                          <span>Pay Now</span>

                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
          4. Recent Bookings
      ====================================================== */}

      <div
        className="
          w-full
          bg-white
          border
          border-slate-200/80
          rounded-xl
          sm:rounded-2xl
          shadow-xs
          overflow-hidden
          min-w-0
        "
      >
        {/* Section Header */}

        <div
          className="
            p-3.5
            sm:p-5
            border-b
            border-slate-100
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
          "
        >
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Recent Bookings
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Quick status overview of your latest package shipments.
            </p>
          </div>

          {/* Mobile Scroll Indicator */}

          <div
            className="
              flex
              md:hidden
              items-center
              gap-1.5
              text-[10px]
              font-semibold
              text-slate-400
              bg-slate-50
              px-2
              py-1
              rounded-md
              border
              border-slate-100
              shrink-0
            "
          >
            <MoveHorizontal className="w-3 h-3 text-slate-400 animate-pulse" />

            <span>Swipe left/right</span>
          </div>
        </div>

        {/* ===================================================
            TABLE SCROLL AREA
        ==================================================== */}

        <div
          className="
            w-full
            overflow-x-scroll
            overflow-y-hidden
            overscroll-x-contain
            touch-pan-x
            min-w-0
            pb-2
          "
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarColor: "#cbd5e1 transparent",
          }}
        >
          <table
            className="
              w-full
              min-w-[900px]
              text-left
              border-collapse
            "
          >
            <thead>
              <tr
                className="
                  bg-slate-50/70
                  border-b
                  border-slate-100
                  text-slate-500
                  text-[10px]
                  sm:text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                "
              >
                <th className="px-4 sm:px-6 py-3 whitespace-nowrap">
                  Package
                </th>

                <th className="px-4 sm:px-6 py-3 whitespace-nowrap">
                  Tracking Number
                </th>

                <th className="px-4 sm:px-6 py-3 whitespace-nowrap">
                  Traveler
                </th>

                <th className="px-4 sm:px-6 py-3 whitespace-nowrap">
                  Reward
                </th>

                <th className="px-4 sm:px-6 py-3 whitespace-nowrap">
                  Escrow
                </th>

                <th className="px-4 sm:px-6 py-3 text-right whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {/* Loading */}

              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="h-9 w-36 bg-slate-100 rounded-lg" />
                    </td>

                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="h-4 w-28 bg-slate-100 rounded" />
                    </td>

                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="h-4 w-24 bg-slate-100 rounded" />
                    </td>

                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="h-4 w-16 bg-slate-100 rounded" />
                    </td>

                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="h-5 w-16 bg-slate-100 rounded-md" />
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 text-right">
                      <div className="h-6 w-20 bg-slate-100 rounded-full ml-auto" />
                    </td>
                  </tr>
                ))
              ) : recentBookings.length === 0 ? (
                /* Empty State */

                <tr>
                  <td
                    colSpan={6}
                    className="
                      px-6
                      py-12
                      text-center
                      text-slate-400
                      text-xs
                    "
                  >
                    No recent bookings available.
                  </td>
                </tr>
              ) : (
                /* Booking Rows */

                recentBookings.map((booking) => {
                  const statusBadge =
                    getStatusBadge(booking.status);

                  const escrowBadgeClass =
                    getEscrowBadge(booking.escrow_status);

                  return (
                    <tr
                      key={booking.id}
                      className="
                        hover:bg-slate-50/60
                        transition-colors
                      "
                    >
                      {/* Package */}

                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                        <div
                          className="
                            flex
                            items-center
                            gap-3
                            max-w-[240px]
                            lg:max-w-[300px]
                          "
                        >
                          <div
                            className="
                              relative
                              w-9
                              h-9
                              sm:w-10
                              sm:h-10
                              rounded-xl
                              overflow-hidden
                              bg-slate-100
                              border
                              border-slate-200/80
                              shrink-0
                            "
                          >
                            {booking.package_image ? (
                              <Image
                                src={booking.package_image}
                                alt={booking.package_title}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div
                                className="
                                  w-full
                                  h-full
                                  flex
                                  items-center
                                  justify-center
                                  text-slate-400
                                  text-xs
                                  font-bold
                                "
                              >
                                📦
                              </div>
                            )}
                          </div>

                          <span className="font-bold text-slate-900 text-xs truncate">
                            {booking.package_title}
                          </span>
                        </div>
                      </td>

                      {/* Tracking */}

                      <td
                        className="
                          px-4
                          sm:px-6
                          py-3.5
                          font-mono
                          font-semibold
                          text-slate-500
                          text-xs
                          whitespace-nowrap
                        "
                      >
                        <span className="inline-block max-w-[160px] truncate align-middle">
                          {booking.tracking_number}
                        </span>
                      </td>

                      {/* Traveler */}

                      <td
                        className="
                          px-4
                          sm:px-6
                          py-3.5
                          font-medium
                          text-slate-700
                          whitespace-nowrap
                        "
                      >
                        <span className="inline-block max-w-[150px] truncate align-middle">
                          {booking.traveler_name ||
                            "Not assigned"}
                        </span>
                      </td>

                      {/* Reward */}

                      <td
                        className="
                          px-4
                          sm:px-6
                          py-3.5
                          font-bold
                          text-slate-900
                          whitespace-nowrap
                        "
                      >
                        <span className="inline-block max-w-[130px] truncate align-middle">
                          {booking.agreed_reward}{" "}
                          {booking.currency}
                        </span>
                      </td>

                      {/* Escrow */}

                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                        <span
                          className={`
                            inline-flex
                            items-center
                            px-2
                            py-0.5
                            rounded-md
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wider
                            border
                            ${escrowBadgeClass}
                          `}
                        >
                          {booking.escrow_status.replace(
                            "_",
                            " "
                          )}
                        </span>
                      </td>

                      {/* Status */}

                      <td
                        className="
                          px-4
                          sm:px-6
                          py-3.5
                          text-right
                          whitespace-nowrap
                        "
                      >
                        <span
                          className={`
                            inline-flex
                            items-center
                            px-2.5
                            py-1
                            rounded-full
                            text-[10px]
                            sm:text-[11px]
                            font-semibold
                            border
                            ${statusBadge.className}
                          `}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Helper Text */}

        <div
          className="
            md:hidden
            flex
            items-center
            justify-center
            gap-1.5
            px-3
            py-2
            text-[10px]
            font-medium
            text-slate-400
            bg-white
            border-t
            border-slate-50
          "
        >
          <MoveHorizontal className="w-3 h-3" />

          <span>
            Swipe horizontally or drag the scrollbar to view
            all columns
          </span>
        </div>
      </div>
    </div>
  );
};


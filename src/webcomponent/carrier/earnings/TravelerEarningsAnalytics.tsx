"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  fetchRevenueDashboardData, 
  WalletDashboardData, 
  MonthlyEarningItem, 
  RecentBookingItem 
} from "@/api/revenue.api";
// import { AcceptDeliveryDialog } from "../delivaries/AcceptDeliveryDialog";
// import { CompleteDilog } from "../delivaries/CompleteDilog";
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
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  ArrowUpRight, 
  Calendar, 
  Briefcase, 
  DollarSign,
  Percent,
  PlaneTakeoff,
  BarChart3,
  Eye,
  Loader2
} from "lucide-react";

const ALL_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function TravelerEarningsAnalytics() {
  // --- UI Interactive States ---
  const [activeTimeframe, setActiveTimeframe] = useState<"monthly" | "yearly">("monthly");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedDelivery, setSelectedDelivery] = useState<RecentBookingItem | null>(null);

  // --- API State Management ---
  const [walletData, setWalletData] = useState<WalletDashboardData | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarningItem[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBookingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all APIs concurrently through the service layer
        const { wallet, monthly, bookings } = await fetchRevenueDashboardData();

        setWalletData(wallet);
        setMonthlyEarnings(monthly || []);
        setRecentBookings(bookings || []);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleView = (booking: RecentBookingItem) => {
    setSelectedDelivery(booking);
    setOpenDialog(true);
  };

  // --- Calculated Dynamic Metrics ---
  const totalEarned = parseFloat(walletData?.total_earned || "0");
  const availableBalance = parseFloat(walletData?.available_balance || "0");
  const pendingReleases = parseFloat(walletData?.pending_releases || "0");
  const completedDeliveries = walletData?.completed_deliveries || 0;
  
  const avgPerTrip = completedDeliveries > 0 ? totalEarned / completedDeliveries : 0;
  
  // Dynamic Current Month Gross calculation from monthly items
  const currentMonthGross = monthlyEarnings.length > 0 
    ? parseFloat(monthlyEarnings[monthlyEarnings.length - 1].earnings) 
    : 0;

  // --- 12-Month Mapping and Dynamic Chart Calculations ---
  const fullYearChartPoints = useMemo(() => {
    const earningsMap = new Map<string, MonthlyEarningItem>();
    monthlyEarnings.forEach((item) => {
      // Handles both full month names and abbreviated names (e.g., "January" -> "Jan")
      const shortName = item.month.substring(0, 3);
      earningsMap.set(shortName.toLowerCase(), item);
    });

    return ALL_MONTHS.map((month) => {
      const match = earningsMap.get(month.toLowerCase());
      const value = match ? parseFloat(match.earnings) : 0;
      const deliveries = match ? match.deliveries : 0;
      return {
        label: month,
        value,
        detail: `${deliveries} delivery(${deliveries === 1 ? "" : "s"}) completed`,
      };
    });
  }, [monthlyEarnings]);

  const chartWidth = 750;
  const chartHeight = 240;
  const paddingLeft = 55; // Space for Y-axis dollar ticks
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  // Calculate Y-Max rounded up to clean $500 step intervals
  const { maxY, yTicks } = useMemo(() => {
    const rawMax = Math.max(...fullYearChartPoints.map((p) => p.value), 100);
    const step = 500;
    const calculatedMax = Math.ceil(rawMax / step) * step || 2000;

    const ticks = [];
    for (let i = 0; i <= calculatedMax; i += step) {
      ticks.push(i);
    }

    return { maxY: calculatedMax, yTicks: ticks };
  }, [fullYearChartPoints]);

  const pointsCoordinates = useMemo(() => {
    const drawableWidth = chartWidth - paddingLeft - paddingRight;
    const drawableHeight = chartHeight - paddingTop - paddingBottom;

    return fullYearChartPoints.map((pt, idx) => {
      const x = paddingLeft + (idx / (fullYearChartPoints.length - 1)) * drawableWidth;
      const y = chartHeight - paddingBottom - (pt.value / maxY) * drawableHeight;
      return { x, y, ...pt };
    });
  }, [fullYearChartPoints, maxY]);

  // Generate Smooth Bézier Curve Path
  const linePath = useMemo(() => {
    if (pointsCoordinates.length < 2) return "";

    return pointsCoordinates.reduce((acc, point, i, arr) => {
      if (i === 0) return `M ${point.x},${point.y}`;

      const prev = arr[i - 1];
      const cx = (prev.x + point.x) / 2;
      return `${acc} C ${cx},${prev.y} ${cx},${point.y} ${point.x},${point.y}`;
    }, "");
  }, [pointsCoordinates]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading traveler analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-16 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center text-sm">
          <p className="font-semibold">Unable to load dashboard</p>
          <p className="mt-1 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-12 md:px-8 px-4 w-full bg-gray-50/30">
      
      {/* 📊 Top Dashboard Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" /> Income Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Deep-dive metric breakdowns of your completed transit jobs and yield performance.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Toggle Controls */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/40">
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "text-xs font-semibold px-4 py-1.5 rounded-lg transition-all",
                activeTimeframe === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
              onClick={() => {
                setActiveTimeframe("monthly");
                setHoveredPoint(null);
              }}
            >
              Monthly view
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "text-xs font-semibold px-4 py-1.5 rounded-lg transition-all",
                activeTimeframe === "yearly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
              onClick={() => {
                setActiveTimeframe("yearly");
                setHoveredPoint(null);
              }}
            >
              Yearly view
            </Button>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 text-blue-700 rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 ml-auto lg:ml-0">
            <span>📦 {completedDeliveries} Jobs Completed</span>
            <span className="text-blue-300">•</span>
            <span>Available: ${availableBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 🧩 1. CORE PERFORMANCE QUAD-METRIC ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Month Gross</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">${currentMonthGross.toFixed(2)}</p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-4 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Active Period
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Earned</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">${totalEarned.toFixed(2)}</p>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 font-medium">
            Pending Releases: <span className="text-purple-600 font-semibold">${pendingReleases.toFixed(2)}</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed Deliveries</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">{completedDeliveries}</p>
            </div>
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-4 font-medium">
            100% Success Rate
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Per Trip</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">${avgPerTrip.toFixed(2)}</p>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-4 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Dynamic yield rate
          </p>
        </div>
      </div>

      {/* 📈 2. VISUAL REFINED LIGHT-CANVAS THIN LINE CHART AREA */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6 relative">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-slate-400">Yield Progress Curve</h3>
            <p className="text-xs text-gray-400 mt-0.5">Continuous graphical analysis based on real monthly performance.</p>
          </div>

          {/* Dynamic HUD Tooltip Panel */}
          <div className={cn(
            "p-3 rounded-xl border bg-slate-950 border-slate-900 text-white flex flex-col gap-0.5 min-w-[180px] shadow-lg transition-all duration-200",
            hoveredPoint !== null ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          )}>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
              {hoveredPoint !== null && fullYearChartPoints[hoveredPoint]?.label} Payout Log
            </span>
            <span className="text-lg font-extrabold text-white">
              ${hoveredPoint !== null && fullYearChartPoints[hoveredPoint]?.value.toFixed(2)}
            </span>
            <span className="text-[11px] text-gray-400 font-medium leading-none mt-1">
              {hoveredPoint !== null && fullYearChartPoints[hoveredPoint]?.detail}
            </span>
          </div>
        </div>

        {/* Scaled Responsive Vector Engine Container */}
        <div className="w-full overflow-hidden pt-2">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-auto overflow-visible"
          >
            {/* Dynamic Y-Axis Dollar Amount Ticks & Horizontal Lines ($0, $500, $1000...) */}
            {yTicks.map((tickVal) => {
              const drawableHeight = chartHeight - paddingTop - paddingBottom;
              const yPos = chartHeight - paddingBottom - (tickVal / maxY) * drawableHeight;

              return (
                <g key={tickVal}>
                  <line 
                    x1={paddingLeft} 
                    y1={yPos} 
                    x2={chartWidth - paddingRight} 
                    y2={yPos} 
                    stroke="#F1F5F9" 
                    strokeWidth="1" 
                    strokeDasharray="3 3" 
                  />
                  <text 
                    x={paddingLeft - 10} 
                    y={yPos + 4} 
                    textAnchor="end" 
                    className="text-[10px] font-medium fill-gray-400"
                  >
                    ${tickVal}
                  </text>
                </g>
              );
            })}

            {/* Bottom X-Axis Line */}
            <line 
              x1={paddingLeft} 
              y1={chartHeight - paddingBottom} 
              x2={chartWidth - paddingRight} 
              y2={chartHeight - paddingBottom} 
              stroke="#E2E8F0" 
              strokeWidth="1.2" 
            />

            {/* Premium Thin Smooth Path */}
            <path
              d={linePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Node Anchor Pins (All 12 Months) */}
            {pointsCoordinates.map((pt, idx) => (
              <g 
                key={idx} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Hit Target */}
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                
                {/* Visual Node */}
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={hoveredPoint === idx ? "4.5" : "2.5"} 
                  fill={hoveredPoint === idx ? "#0f172a" : "#10b981"} 
                  stroke={hoveredPoint === idx ? "#ffffff" : "transparent"} 
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />

                {/* 12 Month Label */}
                <text 
                  x={pt.x} 
                  y={chartHeight - 12} 
                  textAnchor="middle" 
                  className={cn(
                    "text-[10px] font-medium fill-gray-400 transition-colors duration-150",
                    hoveredPoint === idx && "fill-emerald-600 font-bold"
                  )}
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* 📊 3. SPLIT-SCREEN GRIDS (Itemized Bookings Ledger & Monthly Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COMPONENT: ITEMIZED JOB LEDGER (2/3 Width) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-2 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="p-5 border-b border-gray-50">
              <h3 className="font-bold text-gray-900 text-base">Completed Bookings Ledger</h3>
              <p className="text-xs text-gray-400 mt-0.5">Recent completed transit deliveries and reward breakdown</p>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/60">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-gray-500 uppercase py-3.5 pl-5">Tracking Number</TableHead>
                    <TableHead className="text-xs font-bold text-gray-500 uppercase py-3.5">Delivered Date</TableHead>
                    <TableHead className="text-xs font-bold text-gray-500 uppercase py-3.5">Reward</TableHead>
                    <TableHead className="text-xs font-bold text-gray-500 uppercase py-3.5">Status</TableHead>
                    <TableHead className="text-xs font-bold text-gray-500 uppercase py-3.5 pr-5 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => {
                      const normalizedStatus = (booking.status || "COMPLETED").toUpperCase();
                      const style = statusStyles?.[normalizedStatus] || {
                        label: "COMPLETED",
                        bg: "bg-emerald-50",
                        text: "text-emerald-700",
                        border: "border-emerald-200",
                      };

                      return (
                        <TableRow key={booking.id} className="hover:bg-gray-50/30 border-b border-gray-100 last:border-0 transition-colors">
                          <TableCell className="align-middle py-4 pl-5">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-50 text-slate-500 rounded-xl hidden sm:block border border-slate-100/50">
                                <PlaneTakeoff className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-xs text-gray-900 font-mono tracking-wide">
                                  {booking.tracking_number}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                                  ID: {booking.id.slice(0, 8)}...
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="align-middle py-4">
                            <span className="text-xs font-medium text-gray-600">
                              {booking.delivered_at}
                            </span>
                          </TableCell>

                          <TableCell className="align-middle py-4">
                            <span className="text-xs font-extrabold text-slate-900">
                              {booking.currency === "USD" ? "$" : `${booking.currency} `}
                              {parseFloat(booking.reward).toFixed(2)}
                            </span>
                          </TableCell>

                          <TableCell className="align-middle py-4">
                            <div className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide w-fit", style.bg, style.text, style.border)}>
                              {style.label}
                            </div>
                          </TableCell>

                          <TableCell className="align-middle py-4 pr-5 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs font-semibold px-3 h-8 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 rounded-lg transition-all shadow-sm flex items-center gap-1.5 ml-auto"
                              onClick={() => handleView(booking)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-xs text-gray-400">
                        No recent completed bookings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: MONTHLY BREAKDOWN LEDGER (1/3 Width) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6 min-h-[380px]">
          <div>
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-gray-50">Monthly Summary Breakdown</h3>
            <div className="flex flex-col gap-2">
              {monthlyEarnings.length > 0 ? (
                monthlyEarnings.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50/50 rounded-xl transition-colors border border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800">{item.month}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{item.deliveries} delivery({item.deliveries === 1 ? "" : "s"})</span>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600">
                      +${parseFloat(item.earnings).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">No monthly history available.</p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
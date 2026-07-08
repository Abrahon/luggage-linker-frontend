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
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  ArrowUpRight, 
  Calendar, 
  Briefcase, 
  DollarSign,
  Percent,
  ChevronRight,
  PlaneTakeoff,
  BarChart3,
  Eye,
  Scale
} from "lucide-react";

const monthlyBreakdown = [
  { time: "July 2026 (Current)", gross: 250.00, change: "+8.4%", positive: true },
  { time: "June 2026", gross: 500.00, change: "+34.2%", positive: true },
  { time: "May 2026", gross: 450.00, change: "-12.5%", positive: false },
];

const yearlyBreakdown = [
  { year: "2026 YTD", trips: 14, gross: 1910.00, avg: 136.42 },
  { year: "2025 Retrospective", trips: 38, gross: 4820.00, avg: 126.84 },
];

export default function TravelerEarningsAnalytics() {
  const [activeTimeframe, setActiveTimeframe] = useState<"monthly" | "yearly">("monthly");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DelivaryData | null>(null);

  const handleView = (delivery: DelivaryData) => {
    setSelectedDelivery(delivery);
    setOpenDialog(true);
  };

  const allDeliveries = deliveryData;

  // Fully expanded 12-Month dataset timeline tracking parameters
  const chartPoints = activeTimeframe === "monthly"
    ? [
        { label: "aug", value: 310, detail: "Aug 14 Route Batch" },
        { label: "sep", value: 280, detail: "Sep 09 Routine Cargo" },
        { label: "oct", value: 420, detail: "Oct 22 Holiday Influx" },
        { label: "nov", value: 390, detail: "Nov 18 Transit Shift" },
        { label: "dec", value: 580, detail: "Dec 25 Peak Logistics" },
        { label: "jan", value: 210, detail: "Jan 05 Winter Interval" },
        { label: "feb", value: 180, detail: "Feb 12 Flat Cycle" },
        { label: "mar", value: 320, detail: "Mar 19 Cargo Resurge" },
        { label: "apr", value: 240, detail: "Apr 28 Mid-Tier Runs" },
        { label: "may", value: 450, detail: "May 24 Premium Routes" },
        { label: "jun", value: 500, detail: "Jun 08 High Volume" },
        { label: "jul", value: 250, detail: "Jul 07 Current Margin" },
      ]
    : [
        { label: "2023", value: 1450, detail: "Annual Total Gross" },
        { label: "2024", value: 3100, detail: "Annual Total Gross" },
        { label: "2025", value: 4820, detail: "Annual Total Gross" },
        { label: "2026 YTD", value: 1910, detail: "Current Year Yield" },
      ];

  const maxChartValue = Math.max(...chartPoints.map(p => p.value));
  const chartWidth = 700; // Expanded to safely accommodate 12 months with clean gaps
  const chartHeight = 170;
  const paddingX = 35;
  const paddingY = 30;

  const pointsCoordinates = chartPoints.map((pt, idx) => {
    const x = paddingX + (idx * (chartWidth - paddingX * 2)) / (chartPoints.length - 1);
    const y = chartHeight - paddingY - (pt.value / maxChartValue) * (chartHeight - paddingY * 2);
    return { x, y, ...pt };
  });

  const linePath = pointsCoordinates
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div className="flex flex-col gap-8 py-12 md:px-8 px-4 w-full bg-gray-50/30">
      
      {/* 📊 Top Dashboard Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" /> Income Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Deep-dive metric breakdowns of your completed transit jobs and yield performance.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Toggle Controls */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/40">
            <Button
              size="sm"
              variant="ghost"
              className={cn("text-xs font-semibold px-4 py-1.5 rounded-lg transition-all", activeTimeframe === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900")}
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
              className={cn("text-xs font-semibold px-4 py-1.5 rounded-lg transition-all", activeTimeframe === "yearly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900")}
              onClick={() => {
                setActiveTimeframe("yearly");
                setHoveredPoint(null);
              }}
            >
              Yearly view
            </Button>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 text-blue-700 rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 ml-auto lg:ml-0">
            <span>📦 14 Jobs Completed</span>
            <span className="text-blue-300">•</span>
            <span>🌟 100% Delivery Index</span>
          </div>
        </div>
      </div>

      {/* 🧩 1. CORE PERFORMANCE QUAD-METRIC ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Month Gross</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">$250.00</p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-4 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +8.4% vs last month
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Year-to-Date Income</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">$1,910.00</p>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 font-medium">
            Target: <span className="text-purple-600 font-semibold">54% of $3.5k Goal</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed Deliveries</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">14 Jobs</p>
            </div>
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-4 font-medium">
            0 Cancelled / Delayed
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Per Trip</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">$136.42</p>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-4 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> Above regional average
          </p>
        </div>
      </div>

      {/* 📈 2. VISUAL REFINED LIGHT-CANVAS THIN LINE CHART AREA */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6 relative">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-slate-400">Yield Progress Curve</h3>
            <p className="text-xs text-gray-400 mt-0.5">Continuous graphical analysis. Hover on parameters for deep logging metrics.</p>
          </div>

          {/* Dynamic HUD Tooltip Panel displaying day-level contextual records */}
          <div className={cn(
            "p-3 rounded-xl border bg-slate-950 border-slate-900 text-white flex flex-col gap-0.5 min-w-[180px] shadow-lg transition-all duration-200",
            hoveredPoint !== null ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          )}>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
              {hoveredPoint !== null && chartPoints[hoveredPoint]?.label} Payout Log
            </span>
            <span className="text-lg font-extrabold text-white">
              ${hoveredPoint !== null && chartPoints[hoveredPoint]?.value.toFixed(2)}
            </span>
            <span className="text-[11px] text-gray-400 font-medium leading-none mt-1">
              {hoveredPoint !== null && chartPoints[hoveredPoint]?.detail}
            </span>
          </div>
        </div>

        {/* Scaled Responsive Vector Engine Container */}
        <div className="w-full overflow-hidden pt-4">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-auto overflow-visible"
          >
            {/* Horizontal Sub-Grid Alignment Trackers */}
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#E2E8F0" strokeWidth="1.2" />

            {/* Premium Thin Smooth Path */}
            <path
              d={linePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Node Anchor Pins */}
            {pointsCoordinates.map((pt, idx) => (
              <g 
                key={idx} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Wider invisible bounding area to capture hover events easily */}
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                
                {/* Thin core data node dots */}
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={hoveredPoint === idx ? "4" : "2"} 
                  fill={hoveredPoint === idx ? "#0f172a" : "#10b981"} 
                  stroke={hoveredPoint === idx ? "#ffffff" : "transparent"} 
                  strokeWidth="1"
                  className="transition-all duration-150"
                />

                {/* Lower Month Labels with Light / Thin weight overrides */}
                <text 
                  x={pt.x} 
                  y={chartHeight - 10} 
                  textAnchor="middle" 
                  className={cn(
                    "text-[9px] font-light tracking-tight lowercase fill-gray-400 transition-colors duration-150",
                    hoveredPoint === idx && "fill-emerald-600 font-normal"
                  )}
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* 📊 3. SPLIT-SCREEN GRIDS (Ledger on Left, Yield Comparisons on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COMPONENT: ITEMIZED JOB LEDGER (2/3 Width) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:col-span-2 flex flex-col justify-between min-h-[440px]">
          <div>
            <div className="p-5 border-b border-gray-50">
              <h3 className="font-bold text-gray-900 text-base">Itemized Job Ledger</h3>
              <p className="text-xs text-gray-400 mt-0.5">Detailed breakdown of space allocation values and routing parameters</p>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/60">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-gray-500 uppercase py-3.5 pl-5">Booking ID & Route</TableHead>
                    <TableHead className="text-xs font-bold text-gray-500 uppercase py-3.5">Luggage Weight</TableHead>
                    <TableHead className="text-xs font-bold text-gray-500 uppercase py-3.5">Rate (kg)</TableHead>
                    <TableHead className="text-xs font-bold text-gray-500 uppercase py-3.5">Status</TableHead>
                    <TableHead className="text-xs font-bold text-gray-500 uppercase py-3.5 pr-5 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDeliveries.map((delivery) => {
                    const style = statusStyles[delivery.status];

                    return (
                      <TableRow key={delivery.delivaryId} className="hover:bg-gray-50/30 border-b border-gray-100 last:border-0 transition-colors">
                        
                        <TableCell className="align-middle py-4 pl-5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 text-slate-500 rounded-xl hidden sm:block border border-slate-100/50">
                              <PlaneTakeoff className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col">
                              {delivery?.delivaryId !== undefined && delivery?.delivaryId !== null && (
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                                  ID: {String(delivery.delivaryId).slice(0, 8)}
                                </span>
                              )}
                              <span className="font-bold text-sm text-gray-900 font-mono tracking-wide flex items-center gap-1.5">
                                <span>🛫 {delivery?.tripData?.from || "N/A"}</span>
                                <span className="text-gray-400 font-sans text-xs font-normal">➔</span>
                                <span>🛬 {delivery?.tripData?.to || "N/A"}</span>
                              </span>
                              <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                                {typeof delivery.tripData.date === "string" && delivery.tripData.date}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="align-middle py-4">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <Scale className="w-3.5 h-3.5 text-gray-400" />
                            <span>{delivery.tripData.carryWeight} kg</span>
                          </div>
                        </TableCell>

                        <TableCell className="align-middle py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-extrabold text-slate-900">${delivery.tripData.price}</span>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded-full w-fit">
                              🟢 +$20 Addon
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="align-middle py-4">
                          <div className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-sm uppercase tracking-wide w-fit", style.bg, style.text)} style={{ borderColor: "rgba(0,0,0,0.02)" }}>
                            {style.label}
                          </div>
                        </TableCell>

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
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-50 bg-gray-50/30">
            <Button variant="ghost" size="sm" className="w-full text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
              📄 Request Archived Invoices Ledger <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* RIGHT COMPONENT: MACRO TIME YIELDS (1/3 Width) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6 min-h-[440px]">
          <div>
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-gray-50">Historical Months</h3>
            <div className="flex flex-col gap-2">
              {monthlyBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-2.5 hover:bg-gray-50/50 rounded-xl transition-colors">
                  <span className="text-xs font-semibold text-gray-600">{item.time}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">${item.gross.toFixed(2)}</span>
                    <span className={cn(
                      "text-[10px] font-extrabold px-1.5 py-0.5 rounded-md",
                      item.positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    )}>
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-gray-50">Macro Annual Breakdown</h3>
            <div className="flex flex-col gap-3">
              {yearlyBreakdown.map((item, i) => (
                <div key={i} className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100/50 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-800">{item.year}</span>
                    <span className="text-sm font-extrabold text-blue-600">${item.gross.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400 font-semibold">
                    <span>{item.trips} Routes Completed</span>
                    <span>Avg: ${item.avg.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ----------- POPUP MODAL DIALOGS OVERLAYS ----------- */}
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
  );
}
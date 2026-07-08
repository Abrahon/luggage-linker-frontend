import { CardProps } from "@/interface/Card";
import { Breadcrumb, Card } from "@/webcomponent/reusable";

// Fixed: quantity values are now strict numbers to fix the TypeScript compilation error
// Updated array using highly reliable, modern open-source vector paths
const financialAndActiveData: CardProps[] = [
  {
    // High-quality modern wallet icon vector
    icon: "https://api.iconify.design/lucide:wallet.svg?color=%234f46e5",
    title: "Available Balance ($)",
    quantity: 1240,
    sugtitle: "Ready to withdraw",
  },
  {
    // High-quality modern shipping truck vector
    icon: "https://api.iconify.design/lucide:truck.svg?color=%234f46e5",
    title: "Active Deliveries",
    quantity: 3,
    sugtitle: "Packages en route",
  },
  {
    // High-quality modern map route vector
    icon: "https://api.iconify.design/lucide:map.svg?color=%234f46e5",
    title: "Active Trips",
    quantity: 8,
    sugtitle: "Currently in progress",
  },
];

// Apply the same fix to your performanceData array to ensure all dashboard icons load perfectly:
const performanceData: CardProps[] = [
  {
    icon: "https://api.iconify.design/lucide:clipboard-list.svg?color=%2364748b",
    title: "Pending Requests",
    quantity: 5,
    sugtitle: "Awaiting approval",
  },
  {
    icon: "https://api.iconify.design/lucide:star.svg?color=%23eab308",
    title: "Rating (out of 5)",
    quantity: 5,
    sugtitle: "Top tier carrier rank",
  },
  {
    icon: "https://api.iconify.design/lucide:check-circle.svg?color=%2310b981",
    title: "Completed",
    quantity: 20,
    sugtitle: "Successfully delivered",
  },
  {
    icon: "https://api.iconify.design/lucide:banknote.svg?color=%2364748b",
    title: "Pending Earnings ($)",
    quantity: 350,
    sugtitle: "Processing pipeline",
  },
];

const monthlyEarnings = [
  { month: "Jan", amount: 1200 },
  { month: "Feb", amount: 2100 },
  { month: "Mar", amount: 1800 },
  { month: "Apr", amount: 2400 },
  { month: "May", amount: 3100 },
  { month: "Jun", amount: 2800 },
];

export const CarrierDashboard = () => {
  const maxAmount = Math.max(...monthlyEarnings.map((d) => d.amount));

  return (
    <div className="flex flex-col gap-6 py-6 md:mr-4 bg-slate-50/50 min-h-screen text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Header Section */}
      <div className="px-1">
        <Breadcrumb
          title="Total Earnings"
          subtitle="Your Lifetime earnings from deliveries"
          math={[
            {
              mhki: "$5,420.00",
              mhki_subtitle: "From 20 completed deliveries",
            },
          ]}
        />
      </div>

      {/* 2. Top Tier Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
        {financialAndActiveData.map((item, index) => (
          <div key={`top-${index}`} className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md rounded-xl">
            <Card {...item} />
          </div>
        ))}
      </div>

      {/* 3. Secondary Performance Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {performanceData.map((item, index) => (
          <div key={`perf-${index}`} className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md rounded-xl">
            <Card {...item} />
          </div>
        ))}
      </div>

      {/* 4. Sleek Modern Monthly Earnings Chart */}
      <div className="p-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-8">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900">Monthly Earnings Chart</h3>
            <p className="text-xs text-slate-500">Performance insights over the trailing 6 months</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 bg-indigo-50/60 px-3 py-1.5 rounded-lg border border-indigo-100/50">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>Gross Revenue Stream</span>
          </div>
        </div>

        {/* Dynamic Minimalist Bar Graphic */}
        <div className="h-60 w-full flex items-end justify-between gap-3 sm:gap-8 pt-4 border-b border-slate-100">
          {monthlyEarnings.map((data, idx) => {
            const barHeightPercentage = (data.amount / maxAmount) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Popover Pill Tooltip */}
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xl pointer-events-none mb-1 z-10 translate-y-1 group-hover:translate-y-0 tracking-wide">
                  ${data.amount.toLocaleString()}
                </div>
                
                {/* Smooth Gradient Bar */}
                <div 
                  style={{ height: `${barHeightPercentage}%` }}
                  className="w-full bg-gradient-to-t from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 rounded-t-lg transition-all duration-300 cursor-pointer relative shadow-sm group-hover:shadow"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                </div>

                {/* X-Axis Labels */}
                <span className="text-xs font-semibold text-slate-400 mt-3 h-5 group-hover:text-slate-700 transition-colors">{data.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 & 6. Core Activity Data Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Deliveries Component */}
        <div className="p-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-semibold tracking-tight">Active Deliveries (Latest 5)</h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100/80 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Live Track
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-xs tracking-wider uppercase">
                  <th className="pb-3">Delivery ID</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="text-slate-600 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3.5 font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">#DEL-940{i}</td>
                    <td className="py-3.5 text-slate-500 font-medium">New York Terminal, NY</td>
                    <td className="py-3.5 text-right">
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">In Transit</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Requests Component */}
        <div className="p-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-semibold tracking-tight">Pending Requests (Latest 5)</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">Review Queue</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-xs tracking-wider uppercase">
                  <th className="pb-3">Request Payload</th>
                  <th className="pb-3">Est. Payout</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="text-slate-600 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-semibold text-slate-900">Route Offer Expansion #{i * 14}</td>
                    <td className="py-3.5 text-emerald-600 font-bold">${(i * 45 + 110).toFixed(2)}</td>
                    <td className="py-3.5 text-right">
                      <button className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition-all shadow-sm">
                        Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 7, 8 & 9. Footer Context Framework Block */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Trips Component */}
        <div className="p-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight mb-4">Upcoming Trips (Latest 5)</h3>
            <ul className="space-y-2.5 text-sm">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/70 transition-colors rounded-xl border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-800">Boston Hub Route</p>
                    <p className="text-[11px] text-slate-400 font-medium">Scheduled: Oct {12 + i}, 2026</p>
                  </div>
                  <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-100/30">Dispatched</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Notifications Component */}
        <div className="p-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
          <h3 className="text-base font-semibold tracking-tight mb-4">Recent Notifications</h3>
          <div className="space-y-4 text-sm">
            <div className="flex gap-3 items-start">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50 flex-shrink-0" />
              <div>
                <p className="text-slate-700 font-semibold">Ledger Settlement Complete</p>
                <p className="text-xs text-slate-400 font-medium">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 ring-4 ring-amber-50 flex-shrink-0" />
              <div>
                <p className="text-slate-700 font-semibold">Compliance Review Pending</p>
                <p className="text-xs text-slate-400 font-medium">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Summary Premium Card */}
        <div className="p-6 bg-slate-950 text-white rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle Ambient Decorative Glow background effect */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-2xl group-hover:bg-indigo-600/30 transition-all duration-500" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-semibold tracking-tight text-slate-200">Wallet Summary</h3>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2 py-0.5 rounded-md text-slate-300">Default</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Clearing Network ID: **** 4321</p>
          </div>
          
          <div className="my-6 relative z-10">
            <p className="text-[11px] text-indigo-400 tracking-wider uppercase font-semibold">Total Liquidity Ledger</p>
            <p className="text-3xl font-bold tracking-tight text-white mt-1 font-mono">$1,590.00</p>
          </div>
          
          <button className="w-full relative z-10 bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold py-3 rounded-xl transition-all shadow-md active:scale-[0.98]">
            Initiate Clearout / Transfer
          </button>
        </div>
      </div>

    </div>
  );
};
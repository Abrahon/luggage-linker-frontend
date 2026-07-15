import { CardProps } from "@/interface/Card";
import { Card } from "@/webcomponent/reusable";

// The 4 status cards configured precisely to match your text mockup layout values
const dashboardMetrics: CardProps[] = [
  {
    icon: "/dashboard/plandash.svg",
    title: "Active Booking",
    quantity: 5,
    subtitle: "Currently in transit",
  },
  {
    icon: "/dashboard/receipt_pending.svg",
    title: "Pending Booking",
    quantity: 2,
    subtitle: "Awaiting response",
  },
  {
    icon: "/dashboard/checkblack.svg",
    title: "Completed",
    quantity: 18,
    subtitle: "Successfully delivered",
  },
  {
    icon: "/dashboard/wallet.svg", // Ensure you have a matching icon asset for spent wallet metrics
    title: "Total Spent",
    quantity: "$1,240", // Pass string formatting directly into the visual container metric
    subtitle: "Lifetime shipping investment",
  },
];

// Backend simulation utilizing your exact BookingStatus & PaymentStatus text choices
const trackingDeliveries = [
  { id: "LL-2026-001", traveler: "John Doe", status: "PAYMENT_PENDING", payment: "UNPAID" },
  { id: "LL-2026-002", traveler: "Alex", status: "IN_TRANSIT", payment: "PAID" },
  { id: "LL-2026-003", traveler: "Emily", status: "DELIVERED", payment: "PAID" },
  { id: "LL-2026-004", traveler: "David", status: "PENDING", payment: "UNPAID" },
];

export const SenderDashboard = () => {
  
  // Comprehensive mapper explicitly handling your Django BookingStatus models
  const getStatusUI = (status: string) => {
    switch (status) {
      case "PENDING":
        return { 
          text: "Pending Acceptance", 
          color: "bg-gray-100 text-gray-700 border border-gray-200", 
          action: "Waiting", 
          actionClass: "text-gray-400 cursor-not-allowed text-xs font-semibold uppercase tracking-wider bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200" 
        };
      case "TRAVELER_ACCEPTED":
        return { 
          text: "Traveler Accepted", 
          color: "bg-indigo-50 text-indigo-700 border border-indigo-100", 
          action: "View", 
          actionClass: "text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors" 
        };
      case "PAYMENT_PENDING":
        return { 
          text: "Awaiting Payment", 
          color: "bg-amber-50 text-amber-700 border border-amber-200", 
          action: "Pay Now", 
          actionClass: "text-white bg-blue-600 hover:bg-blue-700 font-semibold text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5" 
        };
      case "CONFIRMED":
      case "PICKED_UP":
        return { 
          text: "Confirmed", 
          color: "bg-purple-50 text-purple-700 border border-purple-100", 
          action: "Track", 
          actionClass: "text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors" 
        };
      case "IN_TRANSIT":
        return { 
          text: "In Transit", 
          color: "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse", 
          action: "Track", 
          actionClass: "text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors" 
        };
      case "DELIVERED":
      case "COMPLETED":
        return { 
          text: "Delivered", 
          color: "bg-emerald-50 text-emerald-700 border border-emerald-200", 
          action: "View", 
          actionClass: "text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors" 
        };
      case "REJECTED":
      case "CANCELLED":
      case "EXPIRED":
        return { 
          text: "Cancelled", 
          color: "bg-rose-50 text-rose-700 border border-rose-100", 
          action: "Details", 
          actionClass: "text-gray-500 hover:text-gray-700 text-sm transition-colors" 
        };
      default:
        return { 
          text: status, 
          color: "bg-gray-50 text-gray-600", 
          action: "View", 
          actionClass: "text-blue-600 text-sm" 
        };
    }
  };

  return (
    /* Changed max-w-7xl to w-full and added adaptive padding for full-bleed layouts */
    <div className="flex flex-col gap-6 py-6 w-full px-4 md:px-6 antialiased text-gray-800">
      
      {/* 1. Header & Welcome Area */}
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-5">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hello, Sujon 👋</h1>
        <p className="text-sm text-gray-500">Here's what's happening with your deliveries today.</p>
      </div>

      {/* 2. Grid displaying all 4 cards responsively */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dashboardMetrics.map((item, index) => (
          <div key={index} className="transition-transform duration-200 hover:scale-[1.01]">
            <Card {...item} />
          </div>
        ))}
      </div>

      {/* 3. Tracking Shipment Table */}
      <div className="mt-4 bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden w-full">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Shipment Tracking</h3>
            <p className="text-xs text-gray-500 mt-0.5">Real-time update stream from backend lifecycle statuses</p>
          </div>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Tracking ID</th>
                <th className="px-6 py-4">Traveler</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-normal">
              {trackingDeliveries.map((delivery) => {
                const ui = getStatusUI(delivery.status);
                return (
                  <tr key={delivery.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900 tracking-tight">
                      {delivery.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-750">
                      {delivery.traveler}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${ui.color}`}>
                        {ui.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        className={ui.actionClass}
                        disabled={delivery.status === "PENDING"}
                      >
                        {ui.action}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
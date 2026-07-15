/**
 * Utility helper to map raw backend package status strings 
 * to user-friendly display text and Tailwind CSS color schemas.
 */
export const getStatusConfig = (status: string) => {
  if (!status) {
    return { text: "Unknown", color: "bg-slate-100 text-slate-700 border-slate-200" };
  }

  switch (status.toUpperCase()) {
    case "DRAFT":
      return { 
        text: "Draft", 
        color: "bg-slate-100 text-slate-700 border-slate-200" 
      };
    case "PUBLISHED":
      return { 
        text: "Published", 
        color: "bg-blue-50 text-blue-700 border-blue-200" 
      };
    case "MATCHED":
      return { 
        text: "Matched", 
        color: "bg-purple-50 text-purple-700 border-purple-200" 
      };
    case "BOOKED":
      return { 
        text: "Booked", 
        color: "bg-orange-50 text-orange-700 border-orange-200" 
      };
    case "IN_TRANSIT":
      return { 
        text: "In Transit", 
        color: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" 
      };
    case "DELIVERED":
      return { 
        text: "Delivered", 
        color: "bg-emerald-50 text-emerald-700 border-emerald-200" 
      };
    case "CANCELLED":
      return { 
        text: "Cancelled", 
        color: "bg-rose-50 text-rose-700 border-rose-200" 
      };
    case "EXPIRED":
      return { 
        text: "Expired", 
        color: "bg-zinc-100 text-zinc-600 border-zinc-200" 
      };
    default:
      return { 
        text: status, 
        color: "bg-slate-50 text-slate-600 border-slate-200" 
      };
  }
};
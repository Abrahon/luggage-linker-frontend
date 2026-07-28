export interface StatusStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export const statusStyles: Record<string, StatusStyle> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  TRAVELER_ACCEPTED: {
    label: "Accepted",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  PICKED_UP: {
    label: "Picked Up",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  IN_TRANSIT: {
    label: "In Transit",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};
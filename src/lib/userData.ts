
import {
  Plane,
  Package,
  MessageCircle,
  DollarSign,
  History,
  CheckCircle,
  UserCog,
  FileText,
  Search,
  XCircle,
  Receipt,
} from "lucide-react";

export const carrierLink = [
  {
    label: "My Trips",
    href: "/my-trips",
    icon: Plane, // ✈️ airplane icon
  },
  {
    label: "Pending Requests",
    href: "/pending-requests",
    icon: MessageCircle, // 💬 circular message icon
  },
  {
    label: "Completed Trips",
    href: "/completed-trips",
    icon: CheckCircle, // ✅ success/trip complete
  },
  {
    label: "Canceled Deliveries",
    href: "/canceled-deliveries",
    icon: XCircle, // ❌ canceled deliveries/trips
  },
  {
    label: "Earnings",
    href: "/earnings",
    icon: DollarSign, // 💰 earnings
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: DollarSign, // 💰 earnings
  },
  {
    label: "Withdrawal History",
    href: "/withdrawal-history",
    icon: Receipt, // 🧾 withdrawal history / receipts
  },
  {
    label:'Verification',
    href:'/verification',
    icon: UserCog
  }
];

export const senderLink = [
  {
    label: "Matching Travelers",
    href: "/find-travelers",
    icon: Search, // 💬 similar message/search connection
  },
  {
    label: "My Package",
    href: "/package-list",
    icon: Search, // 💬 similar message/search connection
  },
 {
    label: "My Booking",
    href: "/booking-list",
    icon: Search, // 💬 similar message/search connection
  },
  {
    label: "My Matching",
    href: "/matching-trip",
    icon: Search, // 💬 similar message/search connection
  },
  {
    label: "Delivery History",
    href: "/delivery-history",
    icon: History, // 🕓 history icon
  },
  {
    label: "Payments",
    href: "/payments",
    icon: DollarSign, // 💰
  },
];

export const adminLink = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: FileText, // 🗂 overview/dashboard
  },
  {
    label: "Verification",
    href: "/admin/verification",
    icon: CheckCircle, // ✅ verification check
  },
  {
    label: "Manage User",
    href: "/admin/manage-users",
    icon: UserCog, // ⚙️ manage users
  },
  {
    label: "Trips",
    href: "/admin/trips",
    icon: Plane, // ✈️ trip management
  },
  {
    label: "Packages", 
    href: "/admin/packages",
    icon: Package,

  },

  {
    label: "Payments",
    href: "/admin/payments",
    icon: DollarSign, // 💰 payment management
  },
  {
    label: "Wallet",
    href: "/admin/wallet",
    icon: DollarSign, // 💰 wallet management
  },
  {
    label: "TSA Records",
    href: "/admin/tsa-records",
    icon: History, // 🕓 TSA history
  }
];

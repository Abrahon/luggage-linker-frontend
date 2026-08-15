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
  BarChart3,
  ShieldAlert,
  Wallet,
  CalendarCheck, 
  GitCompare
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
    label: "Disputes",
    href: "/disputes",
    icon: ShieldAlert, // 🛡️ dispute / claim alert icon
  },
  {
    label: "Earnings",
    href: "/earnings",
    icon: DollarSign, // 💰 earnings
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: Wallet, // 👛 wallet (switched from DollarSign for better clarity)
  },
  {
    label: "Withdrawal History",
    href: "/withdrawal-history",
    icon: Receipt, // 🧾 withdrawal history / receipts
  },
  {
    label: "Verification",
    href: "/verification",
    icon: UserCog,
  },
];

export const senderLink = [
  // {
  //   label: "Matching Travelers",
  //   href: "/find-travelers",
  //   icon: Search,
  // },
  {
    label: "My Package",
    href: "/package-list",
    icon: Package, // 📦 Updated from Search for better UX
  },
  {
    label: "My Booking",
    href: "/booking-list",
    icon: CalendarCheck, // 📅 Updated from Search for better UX
  },
  {
    label: "My Matching",
    href: "/matching-trip",
    icon: GitCompare, // 🔀 Updated from Search for better UX
  },
  {
    label: "Delivery History",
    href: "/delivery-history",
    icon: History,
  },
  {
    label: "Wallet",
    href: "/sender-wallet", // 👈 Updated to match your new route
    icon: Wallet,
  },
  {
    label: "Disputes History",
    href: "/sender-disputes", // 👈 Updated to match your new route
    icon: ShieldAlert,
  },

  {
    label: "Payments",
    href: "/payments",
    icon: DollarSign,
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
    label: "Disputes Management",
    href: "/admin/disputes",
    icon: ShieldAlert,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    label: "TSA Records",
    href: "/admin/tsa-records",
    icon: History, // 🕓 TSA history
  }
];

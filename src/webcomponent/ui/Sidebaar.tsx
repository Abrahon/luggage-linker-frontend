"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { senderLink, carrierLink, adminLink } from "@/lib/userData";
import { Home, Package, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Universal routes for sender & traveler
const commonLinks = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Active Deliveries", href: "/active-deliveries", icon: Package },
  { label: "Messages", href: "/messages", icon: MessageCircle },
];

export const SideBaar = () => {
  const pathname = usePathname();
  const { user } = useAuth(); // Read role directly from Auth Context
  const [role, setRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Sync role on mount and when auth context user changes
  useEffect(() => {
    setIsMounted(true);
    // Prioritize context user role, fallback to localStorage helper
    const activeRole = user?.role || getUserRole();
    setRole(activeRole ? activeRole.toUpperCase() : null);
  }, [user]);

  const isCarrierOrTraveler = role === "TRAVELER";
  const isAdmin = role === "ADMIN";

  // Determine navigation links based on normalized user role
  const links = isAdmin
    ? adminLink
    : [...commonLinks, ...(isCarrierOrTraveler ? carrierLink : senderLink)];

  return (
    <div className="flex flex-col h-full bg-white border-r py-6 px-4">
      {/* Logo Section */}
      <div className="flex items-center justify-center mb-10">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="LuggageLinker Logo"
            width={130}
            height={40}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2">
        {/* Render a placeholder skeleton during SSR/hydration phase */}
        {!isMounted ? (
          <div className="flex flex-col gap-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg w-full" />
            ))}
          </div>
        ) : (
          links.map((item) => {
            const Icon = item.icon;

            // Safe pathname matching for active link highlight
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-black hover:bg-gray-100"
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-black"
                    }`}
                  />
                )}
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })
        )}
      </nav>
    </div>
  );
};
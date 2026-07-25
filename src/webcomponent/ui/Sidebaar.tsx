"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { senderLink, carrierLink, adminLink } from "@/lib/userData";
import { Home, Package, MessageCircle } from "lucide-react";

export const SideBaar = () => {
  const pathname = usePathname();
  const role = getUserRole(); // e.g. 'admin', 'carrier', 'sender'

  // Universal routes for sender & carrier
  const commonLinks = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Active Deliveries", href: "/active-deliveries", icon: Package },
    { label: "Messages", href: "/messages", icon: MessageCircle },
  ];

  const isCarrierOrTraveler =
    role === "carrier" || role === "traveler" || role === "TRAVELER";

  // Decide link list based on role
  const links = role === "admin"
    ? adminLink
    : [...commonLinks, ...(isCarrierOrTraveler ? carrierLink : senderLink)];
  console.log("Sidebar links for role:", role, links);
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
          />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive =
          role === 'carrier' ?
            pathname === item.href || pathname.startsWith(`${item.href}/`):pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200
                ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-black hover:bg-gray-100"
                }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "text-white" : "text-black"}`}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

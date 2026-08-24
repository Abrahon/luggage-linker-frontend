"use client";

import { useSyncExternalStore } from "react";
import { useEffect } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getUserRole } from "@/lib/auth";
import { senderLink, carrierLink, adminLink } from "@/lib/userData";
import { Home, Package, MessageCircle, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NavigationItem = {
  label: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
};

const commonLinks: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Active Deliveries", href: "/active-deliveries", icon: Package },
  { label: "Messages", href: "/messages", icon: MessageCircle },
];

interface SideBaarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NavigationContent = ({
  links,
  pathname,
  isMounted,
  onClose,
}: {
  links: NavigationItem[];
  pathname: string;
  isMounted: boolean;
  onClose?: () => void;
}) => (
  <nav className="flex flex-col gap-2">
    {!isMounted ? (
      <div className="flex flex-col gap-2 animate-pulse">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-10 bg-gray-100 rounded-lg w-full" />
        ))}
      </div>
    ) : (
      links.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
              isActive ? "bg-primary text-white" : "text-black hover:bg-gray-100"
            }`}
          >
            {Icon && (
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-black"}`} />
            )}
            <span className="font-medium text-sm">{item.label}</span>
          </Link>
        );
      })
    )}
  </nav>
);

export const SideBaar = ({ isOpen = false, onClose }: SideBaarProps) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const activeRole = user?.role || (isMounted ? getUserRole() : null);
  const role = activeRole ? activeRole.toUpperCase() : null;
  const isCarrierOrTraveler = role === "TRAVELER";
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
  const links = isAdmin
    ? adminLink
    : [...commonLinks, ...(isCarrierOrTraveler ? carrierLink : senderLink)];

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r py-6 px-4 shrink-0 overflow-y-auto">
        <div className="flex items-center justify-center mb-10 shrink-0">
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
        <NavigationContent links={links} pathname={pathname} isMounted={isMounted} />
      </aside>

      {/* ================= MOBILE SIDEBAR DRAWER ================= */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isOpen
            ? "visible pointer-events-auto"
            : "invisible pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />

        {/* Drawer Content */}
        <aside
          aria-label="Mobile navigation"
          className={`relative w-72 max-w-[80vw] h-full bg-white shadow-xl z-10 flex flex-col py-6 px-4 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-8 shrink-0">
            <Link href="/" onClick={onClose}>
              <Image
                src="/logo.svg"
                alt="LuggageLinker Logo"
                width={110}
                height={32}
                className="object-contain"
                priority
              />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <NavigationContent links={links} pathname={pathname} isMounted={isMounted} onClose={onClose} />
        </aside>
      </div>
    </>
  );
};
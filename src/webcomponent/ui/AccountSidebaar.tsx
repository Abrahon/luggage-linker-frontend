"use client";
import { usePathname } from "next/navigation";
import { Home, ShieldBan, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AccountSidebaarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AccountSidebaar = ({ isOpen = false, onClose }: AccountSidebaarProps) => {
  const pathname = usePathname();
  const accountLink = [
    { label: "Profile", href: "/profile", icon: Home },
    { label: "Security", href: "/security", icon: ShieldBan },
  ];
  const navigation = (
    <nav className="flex flex-col gap-2">
      {accountLink.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
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
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col h-full w-64 bg-white border-r py-6 px-4">
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
      {navigation}
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />
        <aside
          aria-label="Mobile account navigation"
          className={`relative w-72 max-w-[80vw] h-full bg-white shadow-xl z-10 flex flex-col py-6 px-4 transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <Image src="/logo.svg" alt="LuggageLinker Logo" width={110} height={32} />
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {navigation}
        </aside>
      </div>
    </>
  );
};

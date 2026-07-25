"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, User, Star, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { getUserRole, logout } from "@/lib/auth";
import { usePathname } from "next/navigation";

export const NavBar = () => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathName = usePathname();
  const role = getUserRole();

  const notifications = [
    {
      id: 1,
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      text: "You got 5 star review from Mescar",
    },
    {
      id: 2,
      icon: <Star className="w-5 h-5 text-blue-500" />,
      text: "New delivery assigned to you",
    },
    {
      id: 3,
      icon: <Star className="w-5 h-5 text-green-500" />,
      text: "Reminder: Pickup scheduled today",
    },
  ];

  return (
    <nav className="w-full flex justify-between items-center py-4 px-6 bg-white shadow-sm border-b">
      {/* Left side */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-semibold text-gray-900">
          Welcome Marcus!
        </h2>
        <p className="text-sm text-gray-600">
          Here’s an overview of your delivery activity and upcoming
          opportunities
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        {pathName !== "/profile" && pathName !== "/security" && (
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <button
                className="relative text-gray-800"
                onClick={() => {
                  setUserMenuOpen(false); // close user menu if open
                }}
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              </button>
            </PopoverTrigger>

            {notificationsOpen && (
              <PopoverContent
                className="w-80 p-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                align="end"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  Notifications
                </h3>
                <div className="border-b border-gray-200 mb-2"></div>
                <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex items-center gap-3">
                      {n.icon}
                      <p className="text-gray-700 text-sm">{n.text}</p>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            )}
          </Popover>
        )}

        {/* User menu */}
        <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <PopoverTrigger asChild>
            <button
              className="text-gray-800"
              onClick={() => {
                setNotificationsOpen(false); // close notifications if open
              }}
            >
              <User className="w-6 h-6 -mt-1" />
            </button>
          </PopoverTrigger>
          {userMenuOpen && (
            <PopoverContent
              className="w-44 p-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              align="end"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href="/profile"
                  prefetch={false}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
                <Link
                  href={role === "admin" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100 rounded-md w-full text-left"
                >
                  <User className="w-4 h-4" /> Logout
                </button>
              </div>
            </PopoverContent>
          )}
        </Popover>
      </div>
    </nav>
  );
};

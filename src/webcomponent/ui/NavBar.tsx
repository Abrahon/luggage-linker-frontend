"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Bell,
  User,
  LayoutDashboard,
  Wallet,
  Package,
  Truck,
  CreditCard,
  CheckCheck,
  Loader2,
  AlertTriangle,
  GitCompare,
  Send,
  Star,
  MessageSquare,
  Info,
  Menu,
} from "lucide-react";
import { getUserRole, logout } from "@/lib/auth";
import {
  getNotifications,
  markAllNotificationsRead,
  NotificationItem,
  NotificationTypeEnum,
} from "@/api/notifications.api";
import { useProfile } from "@/hooks/useProfile";
import { stringToColor } from "@/lib/stringToColor";

/* ==========================================================================
   Helper Functions & Interfaces
   ========================================================================== */
interface DashboardNavBarProps {
  onToggleSidebar?: () => void;
}

const getProfilePictureUrl = (
  url: string | null | undefined
): string | null => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  return `${baseUrl}${url}`;
};

/**
 * Synchronous client-side check for stored auth indicators.
 */
const checkHasStoredAuth = (): boolean => {
  if (typeof window === "undefined") return false;

  const role = getUserRole();
  const hasLocalStorageToken = !!localStorage.getItem("accessToken");

  const hasCookieToken = document.cookie
    .split(";")
    .some((c) => c.trim().split("=")[0] === "accessToken");

  return !!role || hasLocalStorageToken || hasCookieToken;
};

/* ==========================================================================
   1. PUBLIC NAVBAR (Landing Page / Home Page)
   ========================================================================== */
export const PublicNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hasClientToken, setHasClientToken] = useState<boolean>(() =>
    checkHasStoredAuth()
  );
  const { profile } = useProfile();

  useEffect(() => {
    const updateAuth = () => {
      setHasClientToken(checkHasStoredAuth());
    };

    window.addEventListener("storage", updateAuth);
    window.addEventListener("focus", updateAuth);

    return () => {
      window.removeEventListener("storage", updateAuth);
      window.removeEventListener("focus", updateAuth);
    };
  }, [pathname]);

  // Derived authentication state: True if user profile exists OR stored token/role exists
  const isAuthenticated = useMemo(() => {
    return !!profile || hasClientToken;
  }, [profile, hasClientToken]);

  const handleContactClick = () => {
    router.push("/contact-us");
    setOpen(false);
  };


  const handleAboutClick = () => {
    router.push("/about-us");
    setOpen(false);
  };

  const handleTripsClick = () => {
    router.push("/trips");
    setOpen(false);
  };

  const handleLogout = () => {
    logout(); // Centralized logout logic
    setHasClientToken(false);
    setOpen(false);
  };

  const resolvedPictureUrl = getProfilePictureUrl(profile?.profile_picture);
  const displayName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User"
    : "";

  return (
    <nav className="fixed top-0 left-0 w-full z-40 h-20 backdrop-blur-[30px] bg-white/10 border-b border-white/10 font-montserrat">
      <div className="flex justify-between items-center p-4 h-full">
        {/* Left: Logo */}
        <Link href="/" className="flex justify-start gap-2">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={120}
            height={40}
            className="w-auto h-14"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={handleContactClick}
            className="text-white bg-transparent hover:text-yellow-300 transition-colors font-medium"
          >
            Contact Us
          </button>

          {/* Private Route: Visible only when authenticated */}
          {isAuthenticated && (
            <button
              onClick={handleTripsClick}
              className="text-white bg-transparent hover:text-yellow-300 transition-colors font-medium"
            >
              Trips
            </button>
          )}

          {!isAuthenticated ? (
            <>
              <Button variant="outline_white" onClick={() => router.push("/login")}>
                Login
              </Button>

              <Button onClick={() => router.push("/choose-user")}>Signup</Button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 text-white hover:text-yellow-300 transition-colors"
              >
                <div className="relative overflow-hidden w-9 h-9 rounded-full flex items-center justify-center border border-white/30 shrink-0">
                  {resolvedPictureUrl ? (
                    <Image
                      src={resolvedPictureUrl}
                      alt={`${displayName}'s profile`}
                      fill
                      className="object-cover rounded-full"
                      unoptimized
                    />
                  ) : profile?.first_name ? (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-xs font-semibold rounded-full"
                      style={{
                        backgroundColor: stringToColor(profile.first_name),
                      }}
                    >
                      {profile.first_name[0].toUpperCase()}
                    </div>
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="font-medium text-sm max-w-[140px] truncate">
                  {displayName || "Profile"}
                </span>
              </Link>

              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="text-black">
                <Menu className="w-6 h-6 text-white" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 text-white border border-white/20 max-w-[90%] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={80}
                  height={40}
                  className="w-auto h-10"
                />
              </div>

              {isAuthenticated && (
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 text-white hover:text-yellow-300 transition-colors py-2 mb-2 border-b border-white/10"
                >
                  <div className="relative overflow-hidden w-10 h-10 rounded-full flex items-center justify-center border border-white/30 shrink-0">
                    {resolvedPictureUrl ? (
                      <Image
                        src={resolvedPictureUrl}
                        alt={`${displayName}'s profile`}
                        fill
                        className="object-cover rounded-full"
                        unoptimized
                      />
                    ) : profile?.first_name ? (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-sm font-semibold rounded-full"
                        style={{
                          backgroundColor: stringToColor(profile.first_name),
                        }}
                      >
                        {profile.first_name[0].toUpperCase()}
                      </div>
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-base truncate">
                    {displayName || "Profile"}
                  </span>
                </Link>
              )}

              <div className="flex flex-col gap-4 text-lg">
                <button
                  onClick={handleContactClick}
                  className="text-white hover:text-yellow-300 transition-colors text-left font-medium"
                >
                  Contact Us
                </button>
                  <button
                  onClick={handleAboutClick}
                  className="text-white hover:text-yellow-300 transition-colors text-left font-medium"
                >
                  About
                </button>

                {isAuthenticated && (
                  <button
                    onClick={handleTripsClick}
                    className="text-white hover:text-yellow-300 transition-colors text-left font-medium"
                  >
                    Trips
                  </button>
                )}

                {!isAuthenticated ? (
                  <>
                    <Button
                      variant="outline_white"
                      className="w-full"
                      onClick={() => {
                        router.push("/login");
                        setOpen(false);
                      }}
                    >
                      Login
                    </Button>

                    <Button
                      className="w-full"
                      onClick={() => {
                        router.push("/choose-user");
                        setOpen(false);
                      }}
                    >
                      Signup
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  );
};

/* ==========================================================================
   2. DASHBOARD NAVBAR (Authenticated App/Dashboard Area)
   ========================================================================== */
export const NavBar = ({ onToggleSidebar }: DashboardNavBarProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const { profile } = useProfile();
  const pathname = usePathname();
  const router = useRouter();
  const role = getUserRole();

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getNotifications(role ?? undefined);
      if (res?.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingRead(true);
      const res = await markAllNotificationsRead(role ?? undefined);
      if (res?.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const formatBadgeCount = (count: number) => {
    if (count > 99) return "99+";
    return count.toString();
  };

  const renderNotificationIcon = (type: NotificationTypeEnum, title: string) => {
    if (
      title.toLowerCase().includes("dispute") ||
      title.toLowerCase().includes("rejected")
    ) {
      return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
    }

    switch (type) {
      case "MATCH":
        return <GitCompare className="w-4 h-4 text-teal-500 shrink-0" />;
      case "REQUEST":
        return <Send className="w-4 h-4 text-sky-500 shrink-0" />;
      case "BOOKING":
        return <Package className="w-4 h-4 text-blue-500 shrink-0" />;
      case "DELIVERY":
        return <Truck className="w-4 h-4 text-indigo-500 shrink-0" />;
      case "PAYMENT":
        return <CreditCard className="w-4 h-4 text-purple-500 shrink-0" />;
      case "WALLET":
        return <Wallet className="w-4 h-4 text-emerald-500 shrink-0" />;
      case "REVIEW":
        return <Star className="w-4 h-4 text-yellow-500 shrink-0" />;
      case "CHAT":
        return <MessageSquare className="w-4 h-4 text-cyan-500 shrink-0" />;
      case "SYSTEM":
        return <Info className="w-4 h-4 text-gray-500 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500 shrink-0" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  const handleNotificationClick = (actionUrl: string | null) => {
    if (actionUrl) {
      setNotificationsOpen(false);
      router.push(actionUrl);
    }
  };

  const resolvedPictureUrl = getProfilePictureUrl(profile?.profile_picture);

  return (
    <nav className="w-full flex justify-between items-center py-4 px-4 sm:px-6 bg-white shadow-sm border-b sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition focus:outline-none cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* <div className="flex flex-col">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Welcome back!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
            Here’s an overview of your delivery activity and upcoming opportunities
          </p>
        </div> */}
      </div>

      <div className="flex items-center gap-6">
        {pathname !== "/profile" && pathname !== "/security" && (
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <button
                className="relative text-gray-800 p-2 rounded-full hover:bg-gray-100 transition focus:outline-none"
                onClick={() => setUserMenuOpen(false)}
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-sm leading-none select-none z-10">
                    {formatBadgeCount(unreadCount)}
                  </span>
                )}
              </button>
            </PopoverTrigger>

            {notificationsOpen && (
              <PopoverContent
                className="w-80 md:w-96 p-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                align="end"
              >
                <div className="p-3 px-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-900">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={isMarkingRead}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
                    >
                      {isMarkingRead ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCheck className="w-3.5 h-3.5" />
                      )}
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="flex flex-col max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {isLoading ? (
                    <div className="p-6 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item.action_url)}
                        className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-gray-50/80 ${
                          !item.is_read ? "bg-blue-50/30" : ""
                        }`}
                      >
                        {renderNotificationIcon(
                          item.notification_type,
                          item.title
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4 className="text-xs font-semibold text-gray-900 truncate">
                              {item.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {formatTimeAgo(item.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-snug line-clamp-2">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            )}
          </Popover>
        )}

        <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <PopoverTrigger asChild>
            <button
              className="text-gray-800 p-1 rounded-full hover:bg-gray-100 transition focus:outline-none relative overflow-hidden w-9 h-9 flex items-center justify-center shrink-0 border border-gray-200"
              onClick={() => setNotificationsOpen(false)}
              aria-label="User menu"
            >
              {resolvedPictureUrl ? (
                <Image
                  src={resolvedPictureUrl}
                  alt={`${profile?.first_name || "User"}'s profile`}
                  fill
                  className="object-cover rounded-full"
                  unoptimized
                />
              ) : profile?.first_name ? (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-xs font-semibold rounded-full"
                  style={{
                    backgroundColor: stringToColor(profile.first_name),
                  }}
                >
                  {profile.first_name[0].toUpperCase()}
                </div>
              ) : (
                <User className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </PopoverTrigger>
          {userMenuOpen && (
            <PopoverContent
              className="w-48 p-1.5 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
              align="end"
            >
              <div className="flex flex-col gap-0.5">
                <Link
                  href="/profile"
                  prefetch={false}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <User className="w-4 h-4 text-gray-500" /> Profile
                </Link>
                <Link
                  href={role === "ADMIN" ? "/admin" : "/dashboard"}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-gray-500" /> Dashboard
                </Link>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={logout}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition w-full text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-red-500" /> Logout
                </button>
              </div>
            </PopoverContent>
          )}
        </Popover>
      </div>
    </nav>
  );
};
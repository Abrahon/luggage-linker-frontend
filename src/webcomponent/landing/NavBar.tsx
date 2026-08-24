"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Menu, LayoutDashboard, LogOut, ChevronDown, User as UserIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; // Adjust import path if needed

export const Navbar = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleContactClick = () => {
    router.push("/contact-us");
    setMobileOpen(false);
  };

  const handleFindTripsClick = () => {
    router.push("/find-travelers");
    setMobileOpen(false);
  };

  const handleDashboardClick = () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    if (user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    router.push("/");
  };

  const userInitial = user?.name ? user.name[0].toUpperCase() : user?.email[0].toUpperCase() || "U";

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
            onClick={handleFindTripsClick}
            className="text-white bg-transparent hover:text-yellow-300 transition-colors font-medium text-sm"
          >
            Find Trips
          </button>

          <button
            onClick={handleContactClick}
            className="text-white bg-transparent hover:text-yellow-300 transition-colors font-medium text-sm"
          >
            Contact Us
          </button>

          {!isAuthenticated ? (
            <>
              <Button
                variant="outline_white"
                onClick={() => router.push("/login")}
              >
                Login
              </Button>
              <Button onClick={() => router.push("/choose-user")}>
                Signup
              </Button>
            </>
          ) : (
            /* User Profile Avatar with Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full transition-all text-white focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/80 flex items-center justify-center font-bold text-white text-sm shrink-0 border border-white/30">
                  {user?.profile_picture ? (
                    <Image
                      src={user.profile_picture}
                      alt={user.name || "User Avatar"}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <span className="text-sm font-medium max-w-[120px] truncate">
                  {user?.name || user?.email}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900/95 text-white border border-white/20 rounded-xl shadow-xl py-2 z-50 backdrop-blur-md">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-semibold truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    onClick={handleDashboardClick}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors text-left"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-300" />
                    Dashboard
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
            <DialogTrigger asChild>
              <button className="text-white">
                <Menu className="size-10" />
              </button>
            </DialogTrigger>

            <DialogContent className="bg-black/95 text-white border border-white/20 max-w-[90%] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={80}
                  height={40}
                  className="w-auto h-10"
                />
              </div>

              <div className="flex flex-col gap-4 text-lg">
                {isAuthenticated && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white shrink-0">
                      {user?.profile_picture ? (
                        <Image
                          src={user.profile_picture}
                          alt="Avatar"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span>{userInitial}</span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleFindTripsClick}
                  className="text-white hover:text-yellow-300 transition-colors text-left"
                >
                  Find Trips
                </button>

                <button
                  onClick={handleContactClick}
                  className="text-white hover:text-yellow-300 transition-colors text-left"
                >
                  Contact Us
                </button>

                {!isAuthenticated ? (
                  <>
                    <Button
                      variant="outline_white"
                      className="w-full"
                      onClick={() => {
                        router.push("/login");
                        setMobileOpen(false);
                      }}
                    >
                      Login
                    </Button>

                    <Button
                      className="w-full"
                      onClick={() => {
                        router.push("/choose-user");
                        setMobileOpen(false);
                      }}
                    >
                      Signup
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline_white"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleDashboardClick}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  );
};
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Menu } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleContactClick = () => {
    router.push("/contact-us");
    setOpen(false);
  };

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
            className="text-white bg-transparent hover:text-yellow-300 transition-colors"
          >
            Contact Us
          </button>

          <Button variant="outline_white" onClick={() => router.push("/login")}>
            Login
          </Button>

          <Button onClick={() => router.push("/choose-user")}>Signup</Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="text-black">
                <Menu className="w-6 h-6" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 text-white border border-white/20 max-w-[90%] rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4 ">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={80}
                  height={40}
                  className=""
                />
              </div>

              <div className="flex flex-col gap-4 text-lg">
                <button
                  onClick={handleContactClick}
                  className="text-white hover:text-yellow-300 transition-colors text-left"
                >
                  Contact Us
                </button>

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
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  );
};

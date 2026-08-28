"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import {
  ShieldCheck,
  Plane,
  Luggage,
  Coins,
  Globe2,
  Leaf,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

// 🔹 Import your global Auth types
import { UserRole, User } from "@/types/auth";

export const AboutUs = () => {
  const router = useRouter();
  const [carriers, setCarriers] = useState(0);
  const [senders, setSenders] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // 🔹 Authentication & Role State
  // Replace mock code below with your actual Auth hook (e.g., const { user, isAuthenticated } = useAuth();)
  const isAuthenticated = false; 
  const mockUser: User = {
    id: "1",
    email: "user@example.com",
    role: "SENDER", // Toggle between "TRAVELER" and "SENDER" to test
  };
  const role: UserRole | null = mockUser.role;

  // 🔹 Access Control Handler for Traveler trip posting
  const handlePostTripClick = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/my-trips");
      return;
    }

    if (role !== "TRAVELER") {
      alert("Access Denied: Only users registered as a TRAVELER can post trips.");
      return;
    }

    router.push("/my-trips");
  };

  // 🔹 Animate numbers smoothly
  const animateValue = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    end: number,
    duration: number
  ) => {
    let start = 0;
    const increment = end / (duration / 16); // ~60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setter(end);
        clearInterval(timer);
      } else {
        setter(Math.floor(start));
      }
    }, 16);
    return timer;
  };

  // 🔹 Trigger animation on scroll with IntersectionObserver & memory cleanup
  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          timer1 = animateValue(setCarriers, 20000, 1500);
          timer2 = animateValue(setSenders, 15000, 1500);
        }
      },
      { threshold: 0.3 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
      if (timer1) clearInterval(timer1);
      if (timer2) clearInterval(timer2);
    };
  }, [hasAnimated]);

  return (
    <div className="w-full min-w-0 flex flex-col gap-12 sm:gap-16 py-6 sm:py-10 px-0 font-montserrat relative z-20">
      
      {/* 1. HERO & INTRO SECTION */}
      <div className="w-full flex flex-col items-center text-center space-y-4 max-w-4xl mx-auto">
        <HeadingSection
          heading="Connecting People, Unlocking Extra Luggage Space"
          subheading="The smart peer-to-peer delivery platform bridging international travelers and senders."
        />
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
          At <strong className="text-amber-600 font-extrabold">LuggageLinker</strong>, we believe sending packages across borders shouldn’t cost a fortune, and traveling shouldn’t mean leaving empty luggage space on the table.
        </p>
      </div>

      {/* 2. STATS & IMAGE SHOWCASE SECTION */}
      <div
        ref={sectionRef}
        className="w-full border border-slate-200/80 rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-10 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center justify-around gap-8 md:gap-4 py-4">
          
          {/* Left Stat - Carriers */}
          <div className="flex flex-col items-center text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {carriers.toLocaleString()}+
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Active Carriers
            </p>
          </div>

          {/* Center Showcase Image */}
          <div className="relative w-48 sm:w-56 md:w-64 lg:w-72 aspect-3/4 shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-amber-500/10 blur-xl -z-10 transform scale-95" />
            <Image
              src="/about/about.jpg"
              alt="About LuggageLinker"
              fill
              className="object-cover shadow-xl rounded-2xl border-4 border-white"
            />
          </div>

          {/* Right Stat - Senders */}
          <div className="flex flex-col items-center text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
              <Luggage className="w-6 h-6" />
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {senders.toLocaleString()}+
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              Trusted Senders
            </p>
          </div>

        </div>
      </div>

      {/* 3. DUAL TARGET CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
        {/* Senders Card */}
        <div className="group border border-slate-200/80 hover:border-amber-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Luggage className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
              For Senders
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Skip expensive courier fees, tedious customs delays, and rigid delivery schedules. Send gifts, essential goods, or personal belongings with verified travelers flying directly to your destination.
            </p>
            <ul className="space-y-2 pt-2">
              <li className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Fast, direct traveler transport
              </li>
              <li className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Pay a fraction of standard freight rates
              </li>
              <li className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Real-time messaging & item tracking
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <Link href="/find-travelers">
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl h-11 flex items-center justify-center gap-2 shadow-2xs">
                <span>Find a Traveler</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Travelers Card */}
        <div className="group border border-slate-200/80 hover:border-emerald-300 rounded-2xl sm:rounded-3xl p-6 sm:p-8 bg-white shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Plane className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
              For Travelers
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Offset your flight costs effortlessly. Monetize unused kilograms in your checked luggage while helping others in the global community get packages safely.
            </p>
            <ul className="space-y-2 pt-2">
              <li className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Monetize unused baggage capacity
              </li>
              <li className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Secure payouts held in escrow
              </li>
              <li className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Flexible journey listings
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <Button
              onClick={handlePostTripClick}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <span>Post Your Trip</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 4. WHY CHOOSE US / VALUE PROPOSITIONS */}
      <div className="w-full space-y-6">
        <HeadingSection
          heading="Why Choose LuggageLinker"
          subheading="Built around security, affordability, and community trust."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-base">Identity Verification</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every traveler and sender undergoes screening and identity checks before scheduling shipments.
            </p>
          </div>

          <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-base">Escrow Payments</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Funds are safely held in escrow and only released when the recipient confirms safe item delivery.
            </p>
          </div>

          <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-base">Sustainable Shipping</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Leverages existing commercial flights to reduce carbon footprint compared to dedicated cargo planes.
            </p>
          </div>

          <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-base">Global Reach</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connect with international flight routes spanning hundreds of cities worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* 5. MISSION & VISION BANNER */}
      <div className="w-full bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Our Mission
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
              Democratizing global logistics through community travel.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              To empower everyday travelers to deliver packages securely, quickly, and affordably while creating earning opportunities on every journey.
            </p>
          </div>

          <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Globe2 className="w-4 h-4" /> Our Vision
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
              A connected world where shipping overseas is seamless.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A globally connected network where sending an item overseas is as simple, fast, and familiar as asking a trusted friend traveling abroad.
            </p>
          </div>
        </div>
      </div>

      {/* 6. CALL TO ACTION FOOTER */}
      <div className="w-full border border-slate-200/80 rounded-2xl sm:rounded-3xl bg-amber-500/5 p-6 sm:p-10 text-center flex flex-col items-center gap-4">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
          Ready to join the LuggageLinker community?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md">
          Start sending packages for less or earn extra money on your next flight today.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto pt-2">
          <Link href="/find-travelers" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-8 h-12 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl shadow-md">
              Find Travelers
            </Button>
          </Link>
          <Link href="/choose-user" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto px-8 h-12 border-slate-300 font-extrabold text-slate-700 rounded-xl bg-white hover:bg-slate-50"
            >
              Create Account
            </Button>
          </Link>
        </div>
      </div>

    </div>
  );
};

export default AboutUs;
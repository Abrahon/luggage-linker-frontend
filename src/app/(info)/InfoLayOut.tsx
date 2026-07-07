"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/webcomponent/landing/NavBar";

interface InfoLayoutProps {
  children: ReactNode;
}

export const InfoLayout = ({ children }: InfoLayoutProps) => {
  const pathname = usePathname();

  // Map route to breadcrumb title
  const breadcrumbTitles: Record<
    string,
    { lines: string[]; singleLine?: boolean }
  > = {
    "/terms": { lines: ["Terms &", "Conditions"] },
    "/privacy": { lines: ["Privacy", "Policy"] },
    "/tsa-regulation": { lines: ["TSA", "Regulation"] },
    "/about-us": { lines: ["About Us"], singleLine: true },
    "/contact-us": { lines: ["Contact Us"], singleLine: true },
  };

  const breadcrumb = breadcrumbTitles[pathname] || { lines: ["Info", "Page"] };

  return (
    <div className="w-full min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Breadcrumb / Banner */}
      <div
        className="relative w-full h-[300px] bg-cover bg-center flex items-center justify-center py-5"
        style={{ backgroundImage: "url('/landing/hero.jpg')" }}
      >
        <div className="text-center">
          {breadcrumb.singleLine ? (
            <h1 className="text-primary text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight">
              {breadcrumb.lines[0]}
            </h1>
          ) : (
            <>
              <h1 className="text-primary text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight">
                {breadcrumb.lines[0]}
              </h1>
              <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight">
                {breadcrumb.lines[1]}
              </h1>
            </>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="px-6 py-12">{children}</div>
    </div>
  );
};

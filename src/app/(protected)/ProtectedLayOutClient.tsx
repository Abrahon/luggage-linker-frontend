"use client";
import { usePathname } from "next/navigation";
import { SideBaar, AccountSidebaar, NavBar } from "@/webcomponent/ui";
import { ReactNode } from "react";
import { useState } from "react";

export default function ProtectedLayoutClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const accountPaths = ["/profile", "/security"];
  const showAccountPath = accountPaths.some(path => pathname.startsWith(path));

  return (
    <div className="flex h-screen w-full bg-gray-50 font-montserrat overflow-hidden">
      {showAccountPath ? (
        <AccountSidebaar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <SideBaar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
      <div className="flex flex-col flex-1 h-screen">
        <header className="shrink-0">
          <NavBar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 max-md:px-4 font-montserrat">
          {children}
        </main>
      </div>
    </div>
  );
}
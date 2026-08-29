"use client";

import { useState } from "react";
import { SideBaar } from "@/webcomponent/ui/Sidebaar";
import { NavBar } from "@/webcomponent/ui/NavBar";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar gets state and close handler */}
      <SideBaar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* NavBar receives the toggle handler */}
        <NavBar onToggleSidebar={()=> setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
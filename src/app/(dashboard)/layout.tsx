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

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* NavBar receives the toggle handler */}
        <NavBar onToggleSidebar={()=> setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
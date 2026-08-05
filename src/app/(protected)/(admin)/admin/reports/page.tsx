import React from "react";
import { AdminReportsList } from "@/webcomponent/admin/reports/AdminReportsList";

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 w-full">
      <AdminReportsList />
    </div>
  );
}
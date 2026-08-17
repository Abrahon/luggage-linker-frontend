import React, { Suspense } from "react";
import MyPackagesPage from "@/webcomponent/sender/package/MyPackagesPage";

export default function PackageListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading packages...</div>}>
      <MyPackagesPage />
    </Suspense>
  );
}

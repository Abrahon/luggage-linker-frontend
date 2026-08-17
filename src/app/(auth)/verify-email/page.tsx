import React, { Suspense } from "react";
import { VerifyEmail } from "@/webcomponent/auth";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading verification...</div>}>
      <VerifyEmail />
    </Suspense>
  );
}

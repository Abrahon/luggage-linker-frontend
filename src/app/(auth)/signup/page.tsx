import React, { Suspense } from "react";
import { SignUp } from "@/webcomponent/auth";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading signup...</div>}>
      <SignUp />
    </Suspense>
  );
}

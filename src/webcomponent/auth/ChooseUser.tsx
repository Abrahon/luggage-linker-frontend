"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const ChooseUser = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-full text-white space-y-8">
      {/* Logo */}
      <Link href="/">
        <Image
          src="/logo.svg" // 🪪 your logo path
          alt="LuggageLinker Logo"
          width={100}
          height={60}
          className="object-contain"
          priority
        />
      </Link>
      {/* Card Container */}
      <div className="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-2xl px-10 py-8 rounded-2xl">
        <Button
          className="w-56 text-base"
          onClick={() => router.push("/signup?role=traveler")}
        >
          Traveler
        </Button>
        <Button
          variant="outline_white"
          className="w-56 text-base"
          onClick={() => router.push("/signup?role=sender")}
        >
          Sender
        </Button>
      </div>
    </div>
  );
};

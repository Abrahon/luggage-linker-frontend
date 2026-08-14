'use client';

import { useEffect, useState } from "react";
import { getUserRole, type UserRole } from "@/lib/auth";
import { CarrierMessage } from "../carrier/message/CarrierMessage";

export const MessageByRole = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const userRole = getUserRole();
    setRole(userRole);
  }, []);

  // Avoid SSR hydration errors
  if (!isMounted) {
    return null;
  }

  // getUserRole() already normalizes the role to uppercase ("SENDER" | "TRAVELER" | "ADMIN")
  const isAllowed = role === "SENDER" || role === "TRAVELER";

  if (!isAllowed) {
    return null;
  }

  return <CarrierMessage />;
};
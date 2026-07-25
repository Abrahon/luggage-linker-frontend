'use client';

import { getUserRole } from "@/lib/auth";
import { CarrierMessage } from "../carrier/message/CarrierMessage";

export const MessageByRole = () => {
  const role = getUserRole();
  const isCarrierOrTraveler =
    role === "carrier" || role === "traveler" || role === "TRAVELER";

  return <>{isCarrierOrTraveler || role === "sender" ? <CarrierMessage /> : ""}</>;
};
"use client";
import { getUserRole } from "@/lib/auth";
import { ActiveDelivaries } from "../carrier";
import { SenderActiveDelivaries } from "../sender";

export const ActiveDelivariesRole = () => {
  const role = getUserRole();
  const isCarrierOrTraveler =
    role === "carrier" || role === "traveler" || role === "TRAVELER";

  return (
    <>
      {isCarrierOrTraveler ? (
        <ActiveDelivaries />
      ) : role === "sender" ? (
        <SenderActiveDelivaries />
      ) : (
        <div>Hello</div>
      )}
    </>
  );
};

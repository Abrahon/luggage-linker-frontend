// types/auth.ts
export type UserRole = "TRAVELER" | "SENDER";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}
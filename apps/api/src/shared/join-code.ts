import { randomInt } from "node:crypto";

export const JOIN_CODE_TTL_MS = 15 * 60 * 1000;

export function generateJoinCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

export function joinCodeExpiresAt(): Date {
  return new Date(Date.now() + JOIN_CODE_TTL_MS);
}

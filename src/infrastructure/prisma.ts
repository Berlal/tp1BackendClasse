import "dotenv/config";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

function hasPrismaCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

export function isPrismaNotFound(error: unknown): boolean {
  return hasPrismaCode(error, "P2025");
}

export function isPrismaUnique(error: unknown): boolean {
  return hasPrismaCode(error, "P2002");
}

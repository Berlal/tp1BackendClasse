import { DomainError } from "../domain/DomainError";

export function parseId(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new DomainError("Identifiant invalide.");
  }
  return Number(value);
}

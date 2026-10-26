import { DomainError } from "./DomainError";

export class Attack {
  usageCount: number;
  pokemonId: number | null = null;

  constructor(
    public readonly name: string,
    public readonly damage: number,
    public readonly usageLimit: number,
    usageCount = 0,
    public id: number | null = null,
  ) {
    if (name.trim() === "") {
      throw new DomainError("Le nom de l'attaque est obligatoire.");
    }
    if (!Number.isInteger(damage) || damage <= 0) {
      throw new DomainError("Les dégâts doivent être un entier strictement positif.");
    }
    if (!Number.isInteger(usageLimit) || usageLimit <= 0) {
      throw new DomainError("La limite d'usage doit être un entier strictement positif.");
    }
    if (!Number.isInteger(usageCount) || usageCount < 0 || usageCount > usageLimit) {
      throw new DomainError("Le compteur d'usage est invalide.");
    }

    this.usageCount = usageCount;
  }

  canUse(): boolean {
    return this.usageCount < this.usageLimit;
  }

  use(): void {
    if (!this.canUse()) {
      throw new DomainError(`L'attaque ${this.name} ne peut plus être utilisée.`);
    }
    this.usageCount += 1;
  }

  resetUsage(): void {
    this.usageCount = 0;
  }

  describe(): string {
    return `${this.name} — ${this.damage} dégâts, ${this.usageCount}/${this.usageLimit} utilisations`;
  }
}

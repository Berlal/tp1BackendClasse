import { Attack } from "./Attack";
import { DomainError } from "./DomainError";
import type { Trainer } from "./Trainer";

export type AttackOutcome = {
  attackName: string;
  damage: number;
  targetLifePoint: number;
};

export class Pokemon {
  readonly attacks: Attack[] = [];
  trainer: Trainer | null = null;

  constructor(
    public readonly name: string,
    public lifePoint: number,
    public readonly maxLifePoint: number,
    attacks: Attack[] = [],
    public id: number | null = null,
  ) {
    if (name.trim() === "") {
      throw new DomainError("Le nom du Pokémon est obligatoire.");
    }
    if (!Number.isInteger(maxLifePoint) || maxLifePoint <= 0) {
      throw new DomainError("Les PV maximum doivent être un entier strictement positif.");
    }
    if (!Number.isInteger(lifePoint) || lifePoint < 0 || lifePoint > maxLifePoint) {
      throw new DomainError("Les points de vie sont invalides.");
    }

    for (const attack of attacks) {
      this.learnAttack(attack);
    }
  }

  static create(name: string, lifePoint: number): Pokemon {
    return new Pokemon(name, lifePoint, lifePoint);
  }

  learnAttack(attack: Attack): void {
    if (this.attacks.length >= 4) {
      throw new DomainError("Un Pokémon ne peut pas apprendre plus de 4 attaques.");
    }
    if (this.attacks.some((known) => known.name === attack.name)) {
      throw new DomainError(`Le Pokémon connaît déjà l'attaque ${attack.name}.`);
    }
    this.attacks.push(attack);
  }

  heal(): void {
    this.lifePoint = this.maxLifePoint;
    for (const attack of this.attacks) {
      attack.resetUsage();
    }
  }

  attack(target: Pokemon): AttackOutcome | null {
    if (target === this) {
      throw new DomainError("Un Pokémon ne peut pas s'attaquer lui-même.");
    }

    const available = this.attacks.filter((attack) => attack.canUse());
    if (available.length === 0) {
      return null;
    }

    const chosen = available[Math.floor(Math.random() * available.length)];
    chosen.use();
    target.lifePoint = Math.max(0, target.lifePoint - chosen.damage);

    return {
      attackName: chosen.name,
      damage: chosen.damage,
      targetLifePoint: target.lifePoint,
    };
  }
}

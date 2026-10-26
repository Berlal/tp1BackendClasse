import { DomainError } from "./DomainError";
import { Pokemon } from "./Pokemon";
import { Trainer } from "./Trainer";

export type CombatTurn = {
  attackerId: number | null;
  attackerName: string;
  targetId: number | null;
  targetName: string;
  attackName: string | null;
  damage: number;
  targetLifePoint: number;
  skipped: boolean;
};

export type ChallengeResult = {
  draw: boolean;
  winnerId: number | null;
  winnerName: string | null;
  trainerA: Trainer;
  trainerB: Trainer;
  pokemonA: Pokemon;
  pokemonB: Pokemon;
  turns: CombatTurn[];
};

export function randomChallenge(trainerA: Trainer, trainerB: Trainer): ChallengeResult {
  ensureOpponents(trainerA, trainerB);
  trainerA.healAll();
  trainerB.healAll();
  return fight(trainerA, trainerB, pickRandom(trainerA), pickRandom(trainerB));
}

export function deterministicChallenge(trainerA: Trainer, trainerB: Trainer): ChallengeResult {
  ensureOpponents(trainerA, trainerB);
  return fight(trainerA, trainerB, pickStrongest(trainerA), pickStrongest(trainerB));
}

function ensureOpponents(trainerA: Trainer, trainerB: Trainer): void {
  if (trainerA.id !== null && trainerA.id === trainerB.id) {
    throw new DomainError("Un dresseur ne peut pas se défier lui-même.");
  }
}

function requireTeam(trainer: Trainer): void {
  if (trainer.pokemons.length === 0) {
    throw new DomainError(`${trainer.name} n'a aucun Pokémon.`);
  }
}

function pickRandom(trainer: Trainer): Pokemon {
  requireTeam(trainer);
  const index = Math.floor(Math.random() * trainer.pokemons.length);
  return trainer.pokemons[index];
}

function pickStrongest(trainer: Trainer): Pokemon {
  requireTeam(trainer);
  return trainer.pokemons.reduce((best, pokemon) => (pokemon.lifePoint > best.lifePoint ? pokemon : best));
}

function fight(trainerA: Trainer, trainerB: Trainer, pokemonA: Pokemon, pokemonB: Pokemon): ChallengeResult {
  const turns: CombatTurn[] = [];
  const base = { trainerA, trainerB, pokemonA, pokemonB, turns };

  if (pokemonA.lifePoint <= 0 && pokemonB.lifePoint <= 0) {
    return { ...base, draw: true, winnerId: null, winnerName: null };
  }
  if (pokemonA.lifePoint <= 0) {
    return victory(trainerB, base);
  }
  if (pokemonB.lifePoint <= 0) {
    return victory(trainerA, base);
  }

  while (pokemonA.lifePoint > 0 && pokemonB.lifePoint > 0) {
    const lifeBefore = pokemonA.lifePoint + pokemonB.lifePoint;

    const attackFromA = pokemonA.attack(pokemonB);
    turns.push(toTurn(pokemonA, pokemonB, attackFromA));
    if (pokemonB.lifePoint <= 0) {
      return victory(trainerA, base);
    }

    const attackFromB = pokemonB.attack(pokemonA);
    turns.push(toTurn(pokemonB, pokemonA, attackFromB));
    if (pokemonA.lifePoint <= 0) {
      return victory(trainerB, base);
    }

    if (pokemonA.lifePoint + pokemonB.lifePoint === lifeBefore) {
      if (pokemonA.lifePoint > pokemonB.lifePoint) {
        return victory(trainerA, base);
      }
      if (pokemonB.lifePoint > pokemonA.lifePoint) {
        return victory(trainerB, base);
      }
      return { ...base, draw: true, winnerId: null, winnerName: null };
    }
  }

  return { ...base, draw: true, winnerId: null, winnerName: null };
}

function victory(
  winner: Trainer,
  base: Omit<ChallengeResult, "draw" | "winnerId" | "winnerName">,
): ChallengeResult {
  winner.gainExperience(1);
  return {
    ...base,
    draw: false,
    winnerId: winner.id,
    winnerName: winner.name,
  };
}

function toTurn(attacker: Pokemon, target: Pokemon, outcome: ReturnType<Pokemon["attack"]>): CombatTurn {
  return {
    attackerId: attacker.id,
    attackerName: attacker.name,
    targetId: target.id,
    targetName: target.name,
    attackName: outcome?.attackName ?? null,
    damage: outcome?.damage ?? 0,
    targetLifePoint: target.lifePoint,
    skipped: outcome === null,
  };
}

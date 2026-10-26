import { deterministicChallenge, randomChallenge, type ChallengeResult } from "./combat";
import { DomainError } from "./DomainError";
import { Trainer } from "./Trainer";

const FIGHT_COUNT = 100;

export type ArenaResult = {
  draw: boolean;
  winnerId: number | null;
  winnerName: string | null;
  fights: number;
  stoppedEarly: boolean;
  trainerA: Trainer;
  trainerB: Trainer;
  winsA: number;
  winsB: number;
  draws: number;
};

export function randomArena(trainerA: Trainer, trainerB: Trainer): ArenaResult {
  ensureArena(trainerA, trainerB);
  const score = emptyScore();
  for (let fight = 0; fight < FIGHT_COUNT; fight += 1) {
    tally(randomChallenge(trainerA, trainerB), trainerA, score);
  }

  return {
    ...compareByProgress(trainerA, trainerB),
    fights: FIGHT_COUNT,
    stoppedEarly: false,
    trainerA,
    trainerB,
    ...score,
  };
}

export function deterministicArena(trainerA: Trainer, trainerB: Trainer): ArenaResult {
  ensureArena(trainerA, trainerB);
  const score = emptyScore();
  let fights = 0;
  let stoppedEarly = false;

  while (fights < FIGHT_COUNT) {
    if (!hasLivingPokemon(trainerA) || !hasLivingPokemon(trainerB)) {
      stoppedEarly = true;
      break;
    }

    tally(deterministicChallenge(trainerA, trainerB), trainerA, score);
    fights += 1;

    if (!hasLivingPokemon(trainerA) || !hasLivingPokemon(trainerB)) {
      stoppedEarly = true;
      break;
    }
  }

  const outcome = stoppedEarly
    ? survivor(trainerA, trainerB)
    : compareByProgress(trainerA, trainerB);

  return {
    ...outcome,
    fights,
    stoppedEarly,
    trainerA,
    trainerB,
    ...score,
  };
}

function ensureArena(trainerA: Trainer, trainerB: Trainer): void {
  if (trainerA.id !== null && trainerA.id === trainerB.id) {
    throw new DomainError("Un dresseur ne peut pas se défier lui-même.");
  }
  if (trainerA.pokemons.length === 0) {
    throw new DomainError(`${trainerA.name} n'a aucun Pokémon.`);
  }
  if (trainerB.pokemons.length === 0) {
    throw new DomainError(`${trainerB.name} n'a aucun Pokémon.`);
  }
}

function hasLivingPokemon(trainer: Trainer): boolean {
  return trainer.pokemons.some((pokemon) => pokemon.lifePoint > 0);
}

function emptyScore(): Pick<ArenaResult, "winsA" | "winsB" | "draws"> {
  return { winsA: 0, winsB: 0, draws: 0 };
}

function tally(
  result: ChallengeResult,
  trainerA: Trainer,
  score: Pick<ArenaResult, "winsA" | "winsB" | "draws">,
): void {
  if (result.draw || result.winnerId === null) {
    score.draws += 1;
    return;
  }
  if (result.winnerId === trainerA.id) {
    score.winsA += 1;
    return;
  }
  score.winsB += 1;
}

function compareByProgress(trainerA: Trainer, trainerB: Trainer): Pick<ArenaResult, "draw" | "winnerId" | "winnerName"> {
  if (trainerA.level !== trainerB.level) {
    return trainerA.level > trainerB.level ? namedWinner(trainerA) : namedWinner(trainerB);
  }
  if (trainerA.experience !== trainerB.experience) {
    return trainerA.experience > trainerB.experience ? namedWinner(trainerA) : namedWinner(trainerB);
  }
  return { draw: true, winnerId: null, winnerName: null };
}

function survivor(trainerA: Trainer, trainerB: Trainer): Pick<ArenaResult, "draw" | "winnerId" | "winnerName"> {
  const aliveA = hasLivingPokemon(trainerA);
  const aliveB = hasLivingPokemon(trainerB);
  if (aliveA && !aliveB) {
    return namedWinner(trainerA);
  }
  if (aliveB && !aliveA) {
    return namedWinner(trainerB);
  }
  return { draw: true, winnerId: null, winnerName: null };
}

function namedWinner(trainer: Trainer): Pick<ArenaResult, "draw" | "winnerId" | "winnerName"> {
  return { draw: false, winnerId: trainer.id, winnerName: trainer.name };
}

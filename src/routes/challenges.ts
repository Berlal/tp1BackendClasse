import { Router } from "express";
import { DomainError } from "../domain/DomainError";
import type { ChallengeResult } from "../domain/combat";
import { asyncHandler } from "../http/asyncHandler";
import { serializePokemon, serializeTrainer } from "../http/serialize";
import { challengeService } from "../services/ChallengeService";

export const challengeRouter = Router();

challengeRouter.post(
  "/random",
  asyncHandler(async (req, res) => {
    const ids = readTrainerIds(req.body);
    const result = await challengeService.random(ids.trainerAId, ids.trainerBId);
    res.json(serializeChallenge(result));
  }),
);

challengeRouter.post(
  "/deterministic",
  asyncHandler(async (req, res) => {
    const ids = readTrainerIds(req.body);
    const result = await challengeService.deterministic(ids.trainerAId, ids.trainerBId);
    res.json(serializeChallenge(result));
  }),
);

function readTrainerIds(body: { trainerAId?: unknown; trainerBId?: unknown }): {
  trainerAId: number;
  trainerBId: number;
} {
  if (!Number.isInteger(body?.trainerAId) || !Number.isInteger(body?.trainerBId)) {
    throw new DomainError("Les identifiants des deux dresseurs sont obligatoires.");
  }
  return { trainerAId: body.trainerAId as number, trainerBId: body.trainerBId as number };
}

function serializeChallenge(result: ChallengeResult) {
  return {
    draw: result.draw,
    winnerId: result.winnerId,
    winnerName: result.winnerName,
    pokemonA: serializePokemon(result.pokemonA),
    pokemonB: serializePokemon(result.pokemonB),
    turns: result.turns,
    trainerA: serializeTrainer(result.trainerA),
    trainerB: serializeTrainer(result.trainerB),
  };
}

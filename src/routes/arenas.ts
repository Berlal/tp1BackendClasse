import { Router } from "express";
import type { ArenaResult } from "../domain/arena";
import { DomainError } from "../domain/DomainError";
import { asyncHandler } from "../http/asyncHandler";
import { serializeTrainer } from "../http/serialize";
import { arenaService } from "../services/ArenaService";

export const arenaRouter = Router();

arenaRouter.post(
  "/random",
  asyncHandler(async (req, res) => {
    const ids = readTrainerIds(req.body);
    const result = await arenaService.random(ids.trainerAId, ids.trainerBId);
    res.json(serializeArena(result));
  }),
);

arenaRouter.post(
  "/deterministic",
  asyncHandler(async (req, res) => {
    const ids = readTrainerIds(req.body);
    const result = await arenaService.deterministic(ids.trainerAId, ids.trainerBId);
    res.json(serializeArena(result));
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

function serializeArena(result: ArenaResult) {
  return {
    draw: result.draw,
    winnerId: result.winnerId,
    winnerName: result.winnerName,
    fights: result.fights,
    stoppedEarly: result.stoppedEarly,
    winsA: result.winsA,
    winsB: result.winsB,
    draws: result.draws,
    trainerA: serializeTrainer(result.trainerA),
    trainerB: serializeTrainer(result.trainerB),
  };
}

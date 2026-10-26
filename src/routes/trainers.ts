import { Router } from "express";
import { DomainError } from "../domain/DomainError";
import { asyncHandler } from "../http/asyncHandler";
import { serializeTrainer } from "../http/serialize";
import { parseId } from "../http/parseId";
import { trainerRepository } from "../infrastructure/TrainerRepository";

export const trainerRouter = Router();

trainerRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const name = req.body?.name;
    if (typeof name !== "string") {
      throw new DomainError("Le nom du dresseur est obligatoire.");
    }

    const trainer = await trainerRepository.create(name);
    res.status(201).json(serializeTrainer(trainer));
  }),
);

trainerRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const trainers = await trainerRepository.findAll();
    res.json(trainers.map(serializeTrainer));
  }),
);

trainerRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const trainer = await trainerRepository.findById(parseId(req.params.id));
    res.json(serializeTrainer(trainer));
  }),
);

trainerRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await trainerRepository.delete(parseId(req.params.id));
    res.status(204).send();
  }),
);

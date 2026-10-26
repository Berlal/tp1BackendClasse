import { Router } from "express";
import { asyncHandler } from "../http/asyncHandler";
import { parseId } from "../http/parseId";
import { serializeAttack } from "../http/serialize";
import { attackRepository } from "../infrastructure/AttackRepository";

export const attackRouter = Router();

attackRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const attack = await attackRepository.findById(parseId(req.params.id));
    res.json(serializeAttack(attack));
  }),
);

import { Router } from "express";
import { DomainError } from "../domain/DomainError";
import { asyncHandler } from "../http/asyncHandler";
import { serializeTrainer } from "../http/serialize";
import { parseId } from "../http/parseId";
import { pokemonRepository } from "../infrastructure/PokemonRepository";
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

trainerRouter.post(
  "/:id/pokemons",
  asyncHandler(async (req, res) => {
    const pokemonId = req.body?.pokemonId;
    if (!Number.isInteger(pokemonId)) {
      throw new DomainError("L'identifiant du Pokémon est obligatoire.");
    }

    const trainer = await trainerRepository.findById(parseId(req.params.id));
    const pokemon = await pokemonRepository.findById(pokemonId);
    trainer.addPokemon(pokemon);
    await pokemonRepository.save(pokemon);
    const saved = await trainerRepository.findById(trainer.id as number);
    res.json(serializeTrainer(saved));
  }),
);

trainerRouter.post(
  "/:id/tavern",
  asyncHandler(async (req, res) => {
    const trainer = await trainerRepository.findById(parseId(req.params.id));
    trainer.healAll();
    await pokemonRepository.saveAll(trainer.pokemons);
    const saved = await trainerRepository.findById(trainer.id as number);
    res.json(serializeTrainer(saved));
  }),
);

trainerRouter.post(
  "/:id/experience",
  asyncHandler(async (req, res) => {
    const amount = req.body?.amount === undefined ? 1 : req.body.amount;
    const trainer = await trainerRepository.findById(parseId(req.params.id));
    trainer.gainExperience(amount);
    const saved = await trainerRepository.save(trainer);
    res.json(serializeTrainer(saved));
  }),
);

trainerRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await trainerRepository.delete(parseId(req.params.id));
    res.status(204).send();
  }),
);

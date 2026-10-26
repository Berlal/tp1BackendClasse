import { Router } from "express";
import { DomainError } from "../domain/DomainError";
import { asyncHandler } from "../http/asyncHandler";
import { parseId } from "../http/parseId";
import { serializePokemon } from "../http/serialize";
import { pokemonRepository } from "../infrastructure/PokemonRepository";

export const pokemonRouter = Router();

pokemonRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const name = req.body?.name;
    const lifePoint = req.body?.lifePoint;
    if (typeof name !== "string" || !Number.isInteger(lifePoint)) {
      throw new DomainError("Le nom et les points de vie (entier) sont obligatoires.");
    }

    const pokemon = await pokemonRepository.create(name, lifePoint);
    res.status(201).json(serializePokemon(pokemon));
  }),
);

pokemonRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const pokemons = await pokemonRepository.findAll();
    res.json(pokemons.map(serializePokemon));
  }),
);

pokemonRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const pokemon = await pokemonRepository.findById(parseId(req.params.id));
    res.json(serializePokemon(pokemon));
  }),
);

pokemonRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await pokemonRepository.delete(parseId(req.params.id));
    res.status(204).send();
  }),
);

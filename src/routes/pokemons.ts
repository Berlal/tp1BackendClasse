import { Router } from "express";
import { Attack } from "../domain/Attack";
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

pokemonRouter.post(
  "/:id/attacks",
  asyncHandler(async (req, res) => {
    const name = req.body?.name;
    const damage = req.body?.damage;
    const usageLimit = req.body?.usageLimit;
    if (typeof name !== "string" || !Number.isInteger(damage) || !Number.isInteger(usageLimit)) {
      throw new DomainError("Le nom, les dégâts et la limite d'usage sont obligatoires.");
    }

    const pokemon = await pokemonRepository.findById(parseId(req.params.id));
    pokemon.learnAttack(new Attack(name, damage, usageLimit));
    const saved = await pokemonRepository.save(pokemon);
    res.status(201).json(serializePokemon(saved));
  }),
);

pokemonRouter.post(
  "/:id/heal",
  asyncHandler(async (req, res) => {
    const pokemon = await pokemonRepository.findById(parseId(req.params.id));
    pokemon.heal();
    const saved = await pokemonRepository.save(pokemon);
    res.json(serializePokemon(saved));
  }),
);

pokemonRouter.post(
  "/:id/attack",
  asyncHandler(async (req, res) => {
    const targetId = req.body?.targetId;
    if (!Number.isInteger(targetId)) {
      throw new DomainError("L'identifiant de la cible est obligatoire.");
    }

    const attacker = await pokemonRepository.findById(parseId(req.params.id));
    const target = await pokemonRepository.findById(targetId);
    const outcome = attacker.attack(target);

    if (outcome === null) {
      res.json({
        skipped: true,
        attacker: serializePokemon(attacker),
        target: serializePokemon(target),
      });
      return;
    }

    await pokemonRepository.saveAll([attacker, target]);
    const savedAttacker = await pokemonRepository.findById(attacker.id as number);
    const savedTarget = await pokemonRepository.findById(target.id as number);
    res.json({
      skipped: false,
      attackName: outcome.attackName,
      damage: outcome.damage,
      targetLifePoint: outcome.targetLifePoint,
      attacker: serializePokemon(savedAttacker),
      target: serializePokemon(savedTarget),
    });
  }),
);

pokemonRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await pokemonRepository.delete(parseId(req.params.id));
    res.status(204).send();
  }),
);

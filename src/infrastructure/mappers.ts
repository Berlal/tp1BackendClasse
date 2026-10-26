import type { Attack as AttackRow, Pokemon as PokemonRow, Trainer as TrainerRow } from "@prisma/client";
import { Attack } from "../domain/Attack";
import { Pokemon } from "../domain/Pokemon";
import { Trainer } from "../domain/Trainer";

export type PokemonRowWithAttacks = PokemonRow & { attacks: AttackRow[] };
export type TrainerRowWithPokemons = TrainerRow & { pokemons: PokemonRowWithAttacks[] };

export function toAttack(row: AttackRow): Attack {
  const attack = new Attack(row.name, row.damage, row.usageLimit, row.usageCount, row.id);
  attack.pokemonId = row.pokemonId;
  return attack;
}

export function toPokemon(row: PokemonRowWithAttacks): Pokemon {
  const attacks = row.attacks.map(toAttack);
  return new Pokemon(row.name, row.lifePoint, row.maxLifePoint, attacks, row.id);
}

export function toTrainer(row: TrainerRowWithPokemons): Trainer {
  const pokemons = row.pokemons.map(toPokemon);
  return new Trainer(row.name, row.experience, pokemons, row.id);
}

export function attachTrainer(pokemon: Pokemon, trainer: TrainerRow | null): Pokemon {
  if (trainer === null) {
    return pokemon;
  }

  const owner = new Trainer(trainer.name, trainer.experience, [], trainer.id);
  owner.addPokemon(pokemon);
  return pokemon;
}

import { Attack } from "../domain/Attack";
import { Pokemon } from "../domain/Pokemon";
import { Trainer } from "../domain/Trainer";

export function serializeAttack(attack: Attack) {
  return {
    id: attack.id,
    pokemonId: attack.pokemonId,
    name: attack.name,
    damage: attack.damage,
    usageLimit: attack.usageLimit,
    usageCount: attack.usageCount,
    description: attack.describe(),
  };
}

export function serializePokemon(pokemon: Pokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    lifePoint: pokemon.lifePoint,
    maxLifePoint: pokemon.maxLifePoint,
    trainerId: pokemon.trainer?.id ?? null,
    attacks: pokemon.attacks.map(serializeAttack),
  };
}

export function serializeTrainer(trainer: Trainer) {
  return {
    id: trainer.id,
    name: trainer.name,
    level: trainer.level,
    experience: trainer.experience,
    pokemons: trainer.pokemons.map(serializePokemon),
  };
}

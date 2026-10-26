import { deterministicArena, randomArena, type ArenaResult } from "../domain/arena";
import { pokemonRepository } from "../infrastructure/PokemonRepository";
import { trainerRepository } from "../infrastructure/TrainerRepository";

export class ArenaService {
  async random(trainerAId: number, trainerBId: number): Promise<ArenaResult> {
    return this.run(trainerAId, trainerBId, randomArena);
  }

  async deterministic(trainerAId: number, trainerBId: number): Promise<ArenaResult> {
    return this.run(trainerAId, trainerBId, deterministicArena);
  }

  private async run(
    trainerAId: number,
    trainerBId: number,
    arena: typeof randomArena,
  ): Promise<ArenaResult> {
    const trainerA = await trainerRepository.findById(trainerAId);
    const trainerB = await trainerRepository.findById(trainerBId);
    const result = arena(trainerA, trainerB);

    await pokemonRepository.saveAll([...trainerA.pokemons, ...trainerB.pokemons]);
    result.trainerA = await trainerRepository.save(trainerA);
    result.trainerB = await trainerRepository.save(trainerB);
    return result;
  }
}

export const arenaService = new ArenaService();

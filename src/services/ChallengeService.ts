import { deterministicChallenge, randomChallenge, type ChallengeResult } from "../domain/combat";
import { pokemonRepository } from "../infrastructure/PokemonRepository";
import { trainerRepository } from "../infrastructure/TrainerRepository";

export class ChallengeService {
  async random(trainerAId: number, trainerBId: number): Promise<ChallengeResult> {
    return this.run(trainerAId, trainerBId, randomChallenge);
  }

  async deterministic(trainerAId: number, trainerBId: number): Promise<ChallengeResult> {
    return this.run(trainerAId, trainerBId, deterministicChallenge);
  }

  private async run(
    trainerAId: number,
    trainerBId: number,
    challenge: typeof randomChallenge,
  ): Promise<ChallengeResult> {
    const trainerA = await trainerRepository.findById(trainerAId);
    const trainerB = await trainerRepository.findById(trainerBId);
    const result = challenge(trainerA, trainerB);

    await pokemonRepository.saveAll([...trainerA.pokemons, ...trainerB.pokemons]);
    result.trainerA = await trainerRepository.save(trainerA);
    result.trainerB = await trainerRepository.save(trainerB);
    return result;
  }
}

export const challengeService = new ChallengeService();

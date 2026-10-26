import { Pokemon } from "../domain/Pokemon";
import { NotFoundError } from "../http/NotFoundError";
import { attachTrainer, toPokemon } from "./mappers";
import { isPrismaNotFound, prisma } from "./prisma";

const includeAttacks = {
  attacks: { orderBy: { id: "asc" as const } },
  trainer: true,
};

export class PokemonRepository {
  async create(name: string, lifePoint: number): Promise<Pokemon> {
    const pokemon = Pokemon.create(name, lifePoint);
    const row = await prisma.pokemon.create({
      data: {
        name: pokemon.name,
        lifePoint: pokemon.lifePoint,
        maxLifePoint: pokemon.maxLifePoint,
      },
      include: includeAttacks,
    });
    return attachTrainer(toPokemon(row), row.trainer);
  }

  async findAll(): Promise<Pokemon[]> {
    const rows = await prisma.pokemon.findMany({
      orderBy: { id: "asc" },
      include: includeAttacks,
    });
    return rows.map((row) => attachTrainer(toPokemon(row), row.trainer));
  }

  async findById(id: number): Promise<Pokemon> {
    const row = await prisma.pokemon.findUnique({
      where: { id },
      include: includeAttacks,
    });
    if (row === null) {
      throw new NotFoundError("Pokémon introuvable.");
    }
    return attachTrainer(toPokemon(row), row.trainer);
  }

  async delete(id: number): Promise<void> {
    try {
      await prisma.pokemon.delete({ where: { id } });
    } catch (error) {
      if (isPrismaNotFound(error)) {
        throw new NotFoundError("Pokémon introuvable.");
      }
      throw error;
    }
  }
}

export const pokemonRepository = new PokemonRepository();

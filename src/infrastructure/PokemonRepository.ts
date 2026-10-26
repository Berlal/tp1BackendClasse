import type { Prisma, PrismaClient } from "@prisma/client";
import { DomainError } from "../domain/DomainError";
import { Pokemon } from "../domain/Pokemon";
import { NotFoundError } from "../http/NotFoundError";
import { attachTrainer, toPokemon } from "./mappers";
import { isPrismaNotFound, isPrismaUnique, prisma } from "./prisma";

type Db = PrismaClient | Prisma.TransactionClient;

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

  async save(pokemon: Pokemon): Promise<Pokemon> {
    await this.persist(prisma, pokemon);
    return this.findById(pokemon.id as number);
  }

  async saveAll(pokemons: Pokemon[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      for (const pokemon of pokemons) {
        await this.persist(tx, pokemon);
      }
    });
  }

  private async persist(db: Db, pokemon: Pokemon): Promise<void> {
    if (pokemon.id === null) {
      throw new DomainError("Le Pokémon doit être enregistré avant d'être modifié.");
    }

    try {
      await db.pokemon.update({
        where: { id: pokemon.id },
        data: {
          lifePoint: pokemon.lifePoint,
          trainerId: pokemon.trainer?.id ?? null,
        },
      });
    } catch (error) {
      if (isPrismaNotFound(error)) {
        throw new NotFoundError("Pokémon introuvable.");
      }
      throw error;
    }

    for (const attack of pokemon.attacks) {
      if (attack.id === null) {
        try {
          const created = await db.attack.create({
            data: {
              name: attack.name,
              damage: attack.damage,
              usageLimit: attack.usageLimit,
              usageCount: attack.usageCount,
              pokemonId: pokemon.id,
            },
          });
          attack.id = created.id;
          attack.pokemonId = pokemon.id;
        } catch (error) {
          if (isPrismaUnique(error)) {
            throw new DomainError(`Le Pokémon connaît déjà l'attaque ${attack.name}.`);
          }
          throw error;
        }
        continue;
      }

      await db.attack.update({
        where: { id: attack.id },
        data: { usageCount: attack.usageCount },
      });
    }
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

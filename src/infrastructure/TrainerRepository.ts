import { Trainer } from "../domain/Trainer";
import { NotFoundError } from "../http/NotFoundError";
import { isPrismaNotFound, prisma } from "./prisma";
import { toTrainer } from "./mappers";

const includePokemons = {
  pokemons: {
    orderBy: { id: "asc" as const },
    include: {
      attacks: { orderBy: { id: "asc" as const } },
    },
  },
};

export class TrainerRepository {
  async create(name: string): Promise<Trainer> {
    const trainer = new Trainer(name);
    const row = await prisma.trainer.create({
      data: {
        name: trainer.name,
        level: trainer.level,
        experience: trainer.experience,
      },
      include: includePokemons,
    });
    return toTrainer(row);
  }

  async findAll(): Promise<Trainer[]> {
    const rows = await prisma.trainer.findMany({
      orderBy: { id: "asc" },
      include: includePokemons,
    });
    return rows.map(toTrainer);
  }

  async findById(id: number): Promise<Trainer> {
    const row = await prisma.trainer.findUnique({
      where: { id },
      include: includePokemons,
    });
    if (row === null) {
      throw new NotFoundError("Dresseur introuvable.");
    }
    return toTrainer(row);
  }

  async delete(id: number): Promise<void> {
    try {
      await prisma.trainer.delete({ where: { id } });
    } catch (error) {
      if (isPrismaNotFound(error)) {
        throw new NotFoundError("Dresseur introuvable.");
      }
      throw error;
    }
  }
}

export const trainerRepository = new TrainerRepository();

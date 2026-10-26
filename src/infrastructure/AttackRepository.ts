import { Attack } from "../domain/Attack";
import { NotFoundError } from "../http/NotFoundError";
import { toAttack } from "./mappers";
import { prisma } from "./prisma";

export class AttackRepository {
  async findById(id: number): Promise<Attack> {
    const row = await prisma.attack.findUnique({ where: { id } });
    if (row === null) {
      throw new NotFoundError("Attaque introuvable.");
    }
    return toAttack(row);
  }
}

export const attackRepository = new AttackRepository();

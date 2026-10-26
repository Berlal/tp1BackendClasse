import express from "express";
import { DomainError } from "./domain/DomainError";
import { NotFoundError } from "./http/NotFoundError";
import { arenaRouter } from "./routes/arenas";
import { attackRouter } from "./routes/attacks";
import { challengeRouter } from "./routes/challenges";
import { pokemonRouter } from "./routes/pokemons";
import { trainerRouter } from "./routes/trainers";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/trainers", trainerRouter);
app.use("/pokemons", pokemonRouter);
app.use("/attacks", attackRouter);
app.use("/challenges", challengeRouter);
app.use("/arenas", arenaRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({ error: error.message });
    return;
  }

  if (error instanceof DomainError || error instanceof SyntaxError) {
    const message = error instanceof SyntaxError ? "JSON invalide." : error.message;
    res.status(400).json({ error: message });
    return;
  }

  if (error instanceof Error && error.name === "PrismaClientInitializationError") {
    res.status(500).json({ error: "Base de données indisponible." });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Erreur interne." });
});

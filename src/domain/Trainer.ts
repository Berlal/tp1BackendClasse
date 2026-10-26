import { Pokemon } from "./Pokemon";

export class Trainer {
  readonly pokemons: Pokemon[] = [];
  level: number;
  experience: number;

  constructor(
    public readonly name: string,
    experience = 0,
    pokemons: Pokemon[] = [],
    public id: number | null = null,
  ) {
    if (name.trim() === "") {
      throw new Error("Le nom du dresseur est obligatoire.");
    }
    if (!Number.isInteger(experience) || experience < 0) {
      throw new Error("L'expérience doit être un entier positif ou nul.");
    }

    this.experience = experience;
    this.level = 1 + Math.floor(experience / 10);

    for (const pokemon of pokemons) {
      this.addPokemon(pokemon);
    }
  }

  addPokemon(pokemon: Pokemon): void {
    if (this.pokemons.includes(pokemon)) {
      throw new Error("Ce dresseur possède déjà ce Pokémon.");
    }
    if (pokemon.trainer !== null) {
      throw new Error("Ce Pokémon appartient déjà à un dresseur.");
    }

    pokemon.trainer = this;
    this.pokemons.push(pokemon);
  }

  healAll(): void {
    for (const pokemon of this.pokemons) {
      pokemon.heal();
    }
  }

  gainExperience(amount = 1): void {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error("L'expérience gagnée doit être un entier strictement positif.");
    }

    this.experience += amount;
    this.level = 1 + Math.floor(this.experience / 10);
  }
}

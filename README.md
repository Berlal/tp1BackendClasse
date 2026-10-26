# API Pokémon

API REST en Express et TypeScript, reliée à PostgreSQL, pour un système de jeu Pokémon simplifié (classes, dresseurs, combats).

Les dresseurs et les Pokémon se créent, se lisent et se suppriment via l'API. Le soin, les attaques et les combats arrivent dans les commits suivants.

## Prérequis

- Node.js 18 ou plus récent
- PostgreSQL installé dans WSL

## Installer PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
```

Créer l’utilisateur et la base utilisés par l’application :

```bash
sudo -u postgres psql -c "CREATE USER pokemon WITH PASSWORD 'pokemon';"
sudo -u postgres psql -c "CREATE DATABASE pokemon OWNER pokemon;"
sudo -u postgres psql -d pokemon -c "GRANT ALL ON SCHEMA public TO pokemon;"
```

## Lancer l’API

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Vérifier le serveur :

```bash
curl http://localhost:3000/health
```

Réponse attendue : `{"status":"ok"}`.

Créer un dresseur et un Pokémon :

```bash
curl -X POST http://localhost:3000/trainers -H "Content-Type: application/json" -d '{"name":"Sacha"}'
curl -X POST http://localhost:3000/pokemons -H "Content-Type: application/json" -d '{"name":"Pikachu","lifePoint":50}'
```

`DELETE /trainers/:id` laisse les Pokémon en base, sans dresseur. `GET /attacks/:id` renvoie aussi le texte de `describe()`.

Le fichier `.env` reste sur votre machine. Seul `.env.example` est versionné.

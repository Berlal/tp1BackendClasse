# API Pokémon

API REST en Express et TypeScript, reliée à PostgreSQL, pour un système de jeu Pokémon simplifié (classes, dresseurs, combats).

Ce dépôt correspond à la première étape : le serveur répond sur `GET /health`. Les classes et la base arrivent dans les commits suivants.

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
npm run dev
```

Vérifier le serveur :

```bash
curl http://localhost:3000/health
```

Réponse attendue : `{"status":"ok"}`.

Le fichier `.env` reste sur votre machine. Seul `.env.example` est versionné.

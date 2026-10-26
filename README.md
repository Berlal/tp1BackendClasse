# API Pokémon

API REST en Express et TypeScript, reliée à PostgreSQL, pour un jeu Pokémon simplifié. Les règles sont portées par les classes `Attack`, `Pokemon` et `Trainer`. Prisma enregistre leur état.

## Règles

Un Pokémon a un nom, des points de vie actuels (`lifePoint`) et un maximum fixé à la création (`maxLifePoint`). Il connaît au plus 4 attaques, sans doublon de nom.

Une attaque a un nom, des dégâts, une limite d'usage et un compteur. `describe()` renvoie un texte du type `Charge — 10 dégâts, 1/5 utilisations`.

Soigner un Pokémon restaure ses points de vie au maximum et remet les compteurs d'usage à 0. L'attaque choisie est aléatoire parmi celles encore utilisables. Les points de vie ne descendent pas sous 0. S'il n'y a plus d'attaque utilisable, le tour est passé.

Un dresseur a un nom, un niveau et de l'expérience. Il commence au niveau 1 avec 0 d'expérience. `level = 1 + floor(experience / 10)`. L'expérience n'est jamais remise à zéro. Il peut ajouter un Pokémon, soigner toute son équipe à la taverne, et gagner de l'expérience.

Un défi oppose deux dresseurs. Le dresseur A frappe en premier, puis on alterne. Le vainqueur gagne 1 point d'expérience. Un match nul n'en donne pas. Si un round entier ne produit aucun dégât, le Pokémon qui a le plus de points de vie gagne. À points de vie égaux, le match est nul.

- Défi aléatoire : les deux équipes sont soignées, puis chaque dresseur envoie un Pokémon au hasard.
- Défi déterministe : pas de taverne. Chaque dresseur envoie le Pokémon qui a le plus de points de vie. En cas d'égalité, le premier de la liste est choisi.
- Arène aléatoire : 100 défis aléatoires. Le vainqueur de l'arène est le dresseur au niveau le plus haut, puis à l'expérience la plus haute. Égalité parfaite : match nul.
- Arène déterministe : jusqu'à 100 défis déterministes, sans soin entre les combats. Elle s'arrête dès qu'un dresseur n'a plus de Pokémon avec des points de vie. Ce dresseur perd l'arène. Si les 100 combats ont lieu, le classement est le même que pour l'arène aléatoire.

## Prérequis

- Node.js 18 ou plus récent
- PostgreSQL installé dans WSL

## Installer PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
```

Créer l'utilisateur et la base :

```bash
sudo -u postgres psql -c "CREATE USER pokemon WITH PASSWORD 'pokemon';"
sudo -u postgres psql -c "ALTER USER pokemon CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE pokemon OWNER pokemon;"
sudo -u postgres psql -d pokemon -c "GRANT ALL ON SCHEMA public TO pokemon;"
```

`CREATEDB` permet à `npx prisma migrate dev` de créer sa base de contrôle. La ligne `could not change directory ... Permission denied` peut s'afficher avec `sudo -u postgres` : les commandes SQL restent valides si PostgreSQL répond `CREATE ROLE`, `ALTER ROLE`, `CREATE DATABASE` ou `GRANT`.

## Lancer l'API

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Le serveur écoute sur le port 3000. Le fichier `.env` reste sur votre machine. Seul `.env.example` est versionné.

`DELETE /trainers/:id` laisse les Pokémon en base, sans dresseur. Supprimer un Pokémon supprime aussi ses attaques.

## Adresses

| Méthode | Adresse | Corps |
| --- | --- | --- |
| GET | `/health` | |
| POST | `/trainers` | `{ "name": "Sacha" }` |
| GET | `/trainers` et `/trainers/:id` | |
| DELETE | `/trainers/:id` | |
| POST | `/trainers/:id/pokemons` | `{ "pokemonId": 1 }` |
| POST | `/trainers/:id/tavern` | |
| POST | `/trainers/:id/experience` | `{ "amount": 1 }` |
| POST | `/pokemons` | `{ "name": "Pikachu", "lifePoint": 50 }` |
| GET | `/pokemons` et `/pokemons/:id` | |
| DELETE | `/pokemons/:id` | |
| POST | `/pokemons/:id/attacks` | `{ "name": "Charge", "damage": 10, "usageLimit": 5 }` |
| POST | `/pokemons/:id/heal` | |
| POST | `/pokemons/:id/attack` | `{ "targetId": 2 }` |
| GET | `/attacks/:id` | |
| POST | `/challenges/random` | `{ "trainerAId": 1, "trainerBId": 2 }` |
| POST | `/challenges/deterministic` | `{ "trainerAId": 1, "trainerBId": 2 }` |
| POST | `/arenas/random` | `{ "trainerAId": 1, "trainerBId": 2 }` |
| POST | `/arenas/deterministic` | `{ "trainerAId": 1, "trainerBId": 2 }` |

Les erreurs ont la forme `{ "error": "..." }`. Un identifiant inconnu répond 404. Une règle de jeu non respectée répond 400. Si un Pokémon n'a plus d'attaque utilisable, `POST /pokemons/:id/attack` répond 200 avec `"skipped": true`.

Une arène répond avec `fights`, `stoppedEarly`, `winsA`, `winsB`, `draws`, `draw`, `winnerId` et les deux dresseurs.

## Exemple

Remplacez les identifiants par ceux renvoyés à la création.

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/trainers -H "Content-Type: application/json" -d '{"name":"Sacha"}'
curl -X POST http://localhost:3000/trainers -H "Content-Type: application/json" -d '{"name":"Ondine"}'

curl -X POST http://localhost:3000/pokemons -H "Content-Type: application/json" -d '{"name":"Pikachu","lifePoint":50}'
curl -X POST http://localhost:3000/pokemons -H "Content-Type: application/json" -d '{"name":"Carapuce","lifePoint":40}'

curl -X POST http://localhost:3000/pokemons/1/attacks -H "Content-Type: application/json" -d '{"name":"Éclair","damage":20,"usageLimit":5}'
curl -X POST http://localhost:3000/pokemons/2/attacks -H "Content-Type: application/json" -d '{"name":"Pistolet à O","damage":10,"usageLimit":5}'

curl -X POST http://localhost:3000/trainers/1/pokemons -H "Content-Type: application/json" -d '{"pokemonId":1}'
curl -X POST http://localhost:3000/trainers/2/pokemons -H "Content-Type: application/json" -d '{"pokemonId":2}'

curl -X POST http://localhost:3000/challenges/random -H "Content-Type: application/json" -d '{"trainerAId":1,"trainerBId":2}'
curl -X POST http://localhost:3000/arenas/deterministic -H "Content-Type: application/json" -d '{"trainerAId":1,"trainerBId":2}'
```

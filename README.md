<div align="center">

# AJC Professional Simulator

**Plateforme de gestion d'examens en ligne**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Prerequis

| Outil | Version |
|-------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js->=%2018-339933?logo=node.js&logoColor=white) | Requis |
| ![Docker](https://img.shields.io/badge/Docker-latest-2496ED?logo=docker&logoColor=white) | Pour PostgreSQL |

---

## Installation

### 1 - Cloner et installer

```bash
git clone <url-du-repo>
cd exampro
npm install
```

### 2 - Lancer PostgreSQL

```bash
docker compose up -d
```

### 3 - Configurer l'environnement

Creer un fichier `.env` a la racine :

```env
# Base de donnees PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/exampro?schema=public"

# NextAuth
AUTH_SECRET="change-this-to-a-random-secret-in-production"
AUTH_URL="http://localhost:3000"

# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4 - Initialiser la base de donnees

```bash
npm run db:setup
```

### 5 - Generer le client Prisma

```bash
npm run db:generate
```

### 6 - Demarrer le serveur

```bash
npm run dev
```

> Ouvrir **http://localhost:3000** dans le navigateur.

---

## Comptes de test

| Role | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin@exampro.com` | `admin123` |
| **Instructeur** | `instructeur@exampro.com` | `instructor123` |
| **Candidat** | `candidat@test.com` | `test123` |

---

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer le serveur de developpement |
| `npm run build` | Compiler le projet pour la production |
| `npm run start` | Lancer le serveur de production |
| `npm run lint` | Verifier le code avec ESLint |
| `npm run db:generate` | Generer le client Prisma |
| `npm run db:migrate` | Executer les migrations Prisma |
| `npm run db:seed` | Peupler la base avec les donnees de test |
| `npm run db:setup` | Migrations + seed en une commande |

---

## Stack technique

| Technologie | Role |
|-------------|------|
| ![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white) | Framework React |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) | Typage statique |
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white) | ORM |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white) | Base de donnees |
| ![NextAuth](https://img.shields.io/badge/NextAuth-v5-000000?logo=next.js&logoColor=white) | Authentification |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white) | Styles |
| ![Lucide](https://img.shields.io/badge/Lucide-F56565?logo=lucide&logoColor=white) | Icones |

# POC Vermeg — Orchestration de Flux de Données

## Présentation

POC full-stack développé dans le cadre d'un stage chez Vermeg, permettant de définir, exécuter et superviser des flux de traitement de données. L'application offre une interface de gestion complète des pipelines : configuration des connecteurs sources, application de règles de transformation, génération de fichiers de sortie et suivi des exécutions en temps réel.

**Stack :** Spring Boot 4.0.7, React 18, PostgreSQL 18, Docker.

---

## Architecture

Le projet est organisé en 4 couches distinctes :

- **Présentation (React 18 + TypeScript)** — Interface utilisateur SPA servie par Nginx, communication via Axios.
- **Application (Spring Boot 4.0.7)** — API REST, moteur de transformation, pipeline asynchrone, génération de fichiers JSON/XML.
- **Données (Connecteurs)** — Abstraction des sources via le pattern Strategy : DATABASE, REST_API, FILE.
- **Infrastructure (Docker / PostgreSQL 18)** — Stack conteneurisée orchestrée par Docker Compose, persistance JPA/Hibernate.

```
┌─────────────────────────────────────────────────────────┐
│                   PRÉSENTATION                          │
│           React 18 + TypeScript (port 3000)             │
│         Dashboard │ Flux │ Exécutions │ Logs            │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST (Axios)
┌────────────────────────▼────────────────────────────────┐
│                   APPLICATION                           │
│           Spring Boot 4.0.7 (port 8080)                 │
│  FluxController │ ExecutionController │ TransformEngine  │
└──────┬─────────────────────────────────────┬────────────┘
       │ JPA / Hibernate                     │ Connecteurs
┌──────▼──────────┐              ┌───────────▼────────────┐
│  INFRASTRUCTURE │              │        DONNÉES          │
│  PostgreSQL 18  │              │  DATABASE │ REST │ FILE │
│   (port 5433)   │              │     ConnectorFactory    │
└─────────────────┘              └────────────────────────┘
```

---

## Fonctionnalités

- Gestion des flux (CRUD, activation, désactivation)
- 3 types de connecteurs (DATABASE, REST_API, FILE)
- Moteur de transformation (RENAME, FILTER, CAST, CONCAT, DERIVE)
- Génération de fichiers JSON et XML
- Tableau de bord avec KPIs et graphiques
- Historique des exécutions avec logs détaillés
- Pipeline asynchrone avec suivi en temps réel
- Export et téléchargement des fichiers générés

---

## Prérequis

- Java 21+
- Node.js 22+
- Docker Desktop
- Maven 3.9+

---

## Démarrage rapide avec Docker (recommandé)

### 1. Cloner le projet

```bash
git clone https://github.com/yasmine123ab/poc-vermeg.git
cd poc-vermeg
```

### 2. Builder les images

```bash
docker compose build
```

### 3. Démarrer la stack

```bash
docker compose up -d
```

### 4. Accéder à l'application

- Frontend : http://localhost:3000
- Backend API : http://localhost:8080/api
- Health check : http://localhost:8080/actuator/health

### 5. Arrêter la stack

```bash
docker compose down
```

---

## Démarrage en mode développement

### Backend

```bash
cd poc-backend
mvn spring-boot:run
```

Accessible sur http://localhost:8080

### Frontend

```bash
cd poc-frontend
npm install
npm start
```

Accessible sur http://localhost:3000

### Base de données

Créer la base manuellement dans PostgreSQL :

```sql
CREATE DATABASE poc_vermeg;
```

Les tables sont créées automatiquement par Hibernate au démarrage.

---

## Structure du projet

```
poc-vermeg/
├── poc-backend/
│   ├── src/main/java/com/vermeg/pocbackend/
│   │   ├── controller/        ← Endpoints REST
│   │   ├── service/           ← Logique métier
│   │   ├── repository/        ← Accès base de données
│   │   ├── model/             ← Entités JPA
│   │   ├── connector/         ← Connecteurs de données
│   │   ├── engine/            ← Moteur de transformation
│   │   ├── dto/               ← Objets de transfert
│   │   ├── config/            ← Configuration Spring
│   │   └── exception/         ← Gestion des erreurs
│   ├── src/test/              ← Tests JUnit
│   └── Dockerfile
├── poc-frontend/
│   ├── src/
│   │   ├── api/               ← Appels HTTP Axios
│   │   ├── components/        ← Composants réutilisables
│   │   ├── pages/             ← Pages de l'application
│   │   └── types/             ← Types TypeScript
│   └── Dockerfile
├── docker-compose.yml
├── init.sql
└── README.md
```

---

## API REST — Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/flux | Lister les flux (paginé) |
| POST | /api/flux | Créer un flux |
| GET | /api/flux/{id} | Récupérer un flux |
| PUT | /api/flux/{id} | Modifier un flux |
| DELETE | /api/flux/{id} | Supprimer un flux |
| POST | /api/flux/{id}/activate | Activer un flux |
| POST | /api/flux/{id}/deactivate | Désactiver un flux |
| POST | /api/executions/flux/{id} | Déclencher une exécution |
| GET | /api/executions | Historique des exécutions |
| GET | /api/executions/{id} | Détail d'une exécution |
| GET | /api/executions/{id}/logs | Logs d'une exécution |
| GET | /api/executions/{id}/file | Télécharger le fichier généré |

---

## Tests

```bash
cd poc-backend
mvn test
```

**43 tests — 7 classes de test** couvrant :

- **Tests unitaires :** FluxService, TransformEngine, DatabaseConnector, ConnectorFactory
- **Tests d'intégration :** FluxController, ExecutionController (avec H2 in-memory)

---

## Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Backend | Spring Boot | 4.0.7 |
| Langage | Java | 21 |
| Persistance | Spring Data JPA / Hibernate | 7 |
| Base de données | PostgreSQL | 18 |
| Frontend | React | 18 |
| Langage UI | TypeScript | 4.9 |
| HTTP Client | Axios | 1.6 |
| Graphiques | Recharts | 2.7 |
| Conteneurs | Docker Compose | 3.8 |
| Build backend | Maven | 3.9 |
| Tests | JUnit 5 + Mockito | 5.x |

---

## Patterns de conception utilisés

- **Strategy** : connecteurs interchangeables (DatabaseConnector, RestApiConnector, FileConnector)
- **Factory** : ConnectorFactory résout le bon connecteur selon le type
- **DTO Pattern** : séparation entités JPA et objets API
- **Repository Pattern** : abstraction de la couche persistance
- **Async/Polling** : pipeline asynchrone avec suivi temps réel

---

## Limitations du POC

- Authentification non implémentée (prévu JWT en production)
- Connecteur MESSAGE_QUEUE optionnel non développé
- Pas de planification automatique (cron)
- Stockage fichiers local (prévu S3/MinIO en production)

---

## Auteur

**Yasmine Aboud** — Stage d'été 2025 — Vermeg

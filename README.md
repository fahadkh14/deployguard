# DeployGuard

A self-service DevOps deployment platform. Register an application, pick a target environment and
version, trigger a deployment, and watch it move through a simulated CI/CD pipeline from a live
dashboard.

This project is built as a realistic portfolio piece for a Fresher DevOps Engineer: a clean,
production-style full-stack application first — with the actual infrastructure (Kubernetes, CI
runners, IaC) intentionally left for a later phase.

---

## 1. Project Overview

DeployGuard lets a developer:

- Register applications with their Git repository, branch, and target environment
- Manage deployment environments (Development, Staging, Production)
- Trigger deployments of a specific application version to a specific environment
- Watch a deployment move through a simulated pipeline (Queued → Build → Test → Security Scan →
  Image Build → Deployment → Health Check)
- Roll back a deployment to the last known good version
- Monitor overall deployment health from a dashboard (success rate, running deployments, recent
  activity)

No real infrastructure is touched yet — deployments are simulated synchronously in the backend so
the full application can be built, tested, and demoed end-to-end before Docker/Kubernetes/CI are
introduced.

---

## 2. Features

- **Dashboard** — total applications, total/successful/failed/running deployments, success rate,
  recent deployment activity
- **Application management** — full CRUD, each with git repo URL, branch, default environment,
  and current version
- **Environment management** — full CRUD for Development / Staging / Production (or custom)
  environments, each with a status (Active / Inactive / Maintenance)
- **Deployment management** — start a deployment, view all deployments, filter by application or
  environment, update status, roll back
- **Deployment detail view** — a pipeline "rail" timeline showing every stage with its status,
  timing, and duration
- **Structured error handling** — consistent JSON error shape from the API, and graceful
  loading/empty/error states in the UI

---

## 3. Architecture

```
┌──────────────┐      REST/JSON       ┌───────────────┐      JDBC       ┌────────────┐
│   Frontend    │ ───────────────────▶ │    Backend     │ ──────────────▶ │ PostgreSQL │
│  React + Vite │ ◀─────────────────── │ Spring Boot 3  │ ◀────────────── │            │
└──────────────┘                      └───────────────┘                 └────────────┘
```

The backend follows a layered architecture:

```
controller  → HTTP concerns only (routes, status codes)
service     → business logic, transactions, orchestration
repository  → Spring Data JPA persistence
entity      → JPA-mapped domain model
dto         → request/response contracts (never expose entities directly)
exception   → domain exceptions + a global exception handler
config      → cross-cutting configuration (CORS, etc.)
```

---

## 4. Technology Stack

**Frontend:** React, Vite, JavaScript, HTML5, CSS3, Axios, React Router
**Backend:** Java 21, Spring Boot 3.3, Maven, Spring Web, Spring Data JPA, PostgreSQL Driver, Bean
Validation, Lombok
**Database:** PostgreSQL 16
**Containers:** Docker, docker-compose

---

## 5. Repository Structure

```
deployguard/
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
│
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       ├── App.jsx
│       └── main.jsx
│
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/deployguard/
│       │   │   ├── controller/
│       │   │   ├── service/
│       │   │   ├── repository/
│       │   │   ├── entity/
│       │   │   ├── dto/
│       │   │   ├── exception/
│       │   │   └── config/
│       │   └── resources/
│       │       └── application.yml
│       └── test/
│
├── database/
│   └── init.sql
│
└── docker/
    ├── frontend.Dockerfile
    └── backend.Dockerfile
```

---

## 6. Prerequisites

- Java 21 (JDK)
- Maven 3.9+ (or use your IDE's bundled Maven)
- Node.js 20+ and npm
- PostgreSQL 16 (local install) **or** Docker + Docker Compose
- Git

---

## 7. Environment Variables

Copy `.env.example` to `.env` in the project root and fill in real values. **Never commit a real
`.env` file.**

| Variable        | Used by  | Description                                    | Example                   |
|-----------------|----------|-------------------------------------------------|----------------------------|
| `DB_HOST`       | backend  | PostgreSQL host                                 | `localhost` / `postgres`  |
| `DB_PORT`       | backend  | PostgreSQL port                                 | `5432`                    |
| `DB_NAME`       | backend  | Database name                                   | `deployguard`             |
| `DB_USER`       | backend  | Database user                                   | `deployguard_user`        |
| `DB_PASSWORD`   | backend  | Database password                               | *(set your own)*          |
| `FRONTEND_URL`  | backend  | Allowed CORS origin(s), comma-separated         | `http://localhost:5173`   |
| `BACKEND_PORT`  | compose  | Host port mapped to the backend container       | `8080`                    |
| `VITE_API_URL`  | frontend | Base URL the frontend uses to call the backend  | `http://localhost:8080`   |

The frontend also has its own `frontend/.env.example` for local (non-Docker) development.

---

## 8. Database Setup

**Option A — local PostgreSQL:**

```bash
createdb deployguard
psql -U <your_user> -d deployguard -f database/init.sql
```

**Option B — Docker (recommended):** the `postgres` service in `docker-compose.yml` automatically
runs `database/init.sql` on first startup via the Postgres image's `docker-entrypoint-initdb.d`
mechanism — no manual step needed.

The script creates all tables (`users`, `environments`, `applications`, `deployments`,
`deployment_stages`, `deployment_logs`) with primary keys, foreign keys, indexes, and check
constraints, then inserts sample environments, applications, and deployments.

---

## 9. Backend Setup (run locally, without Docker)

```bash
cd backend
cp ../.env.example ../.env   # if you haven't already, then export the DB_* vars below
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=deployguard
export DB_USER=deployguard_user
export DB_PASSWORD=change_me_locally
export FRONTEND_URL=http://localhost:5173

mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

Run the backend test suite:

```bash
cd backend
mvn test
```

---

## 10. Frontend Setup (run locally, without Docker)

```bash
cd frontend
cp .env.example .env   # adjust VITE_API_URL if needed
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

Build a production bundle:

```bash
npm run build
```

---

## 11. Docker Setup (run everything together)

From the project root:

```bash
cp .env.example .env   # fill in DB_PASSWORD at minimum
docker compose up --build
```

This starts three containers:

- `deployguard-postgres` — PostgreSQL, seeded from `database/init.sql`
- `deployguard-backend` — Spring Boot API on port `8080`
- `deployguard-frontend` — the built React app served by nginx on port `5173`

Visit `http://localhost:5173` once all three are healthy.

To stop:

```bash
docker compose down
```

To also remove the database volume (full reset):

```bash
docker compose down -v
```

---

## 12. API Documentation

Base URL: `http://localhost:8080/api`

### Applications

| Method | Path                          | Description                       |
|--------|-------------------------------|------------------------------------|
| GET    | `/applications`                | List all applications             |
| GET    | `/applications/{id}`           | Get one application               |
| POST   | `/applications`                | Create an application             |
| PUT    | `/applications/{id}`           | Update an application             |
| DELETE | `/applications/{id}`           | Delete an application              |
| GET    | `/applications/{id}/deployments` | List deployments for an application |

### Environments

| Method | Path                          | Description                       |
|--------|-------------------------------|------------------------------------|
| GET    | `/environments`                | List all environments             |
| GET    | `/environments/{id}`           | Get one environment               |
| POST   | `/environments`                | Create an environment             |
| PUT    | `/environments/{id}`           | Update an environment             |
| DELETE | `/environments/{id}`           | Delete an environment              |
| GET    | `/environments/{id}/deployments` | List deployments for an environment |

### Deployments

| Method | Path                          | Description                       |
|--------|-------------------------------|------------------------------------|
| GET    | `/deployments`                 | List all deployments              |
| GET    | `/deployments/{id}`            | Get one deployment (with stages)  |
| POST   | `/deployments`                 | Start a new deployment            |
| PATCH  | `/deployments/{id}/status`     | Update a deployment's status      |
| POST   | `/deployments/{id}/rollback`   | Roll back a deployment            |

### Dashboard

| Method | Path                | Description                         |
|--------|---------------------|--------------------------------------|
| GET    | `/dashboard/summary` | Aggregated metrics for the dashboard |

### Error shape

All errors follow the same structure:

```json
{
  "timestamp": "2026-08-10T10:15:30",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed for one or more fields",
  "path": "/api/applications",
  "details": ["name: Application name is required"]
}
```

---

## 13. Screenshots

_Add screenshots of the Dashboard, Applications list, Application detail, and Deployment detail
(with the pipeline timeline) here once you've run the app locally._

---

## 14. Future DevOps Roadmap

This phase intentionally stops at a working full-stack application. The next phases (not yet
implemented) are:

1. **Containerization** — Dockerfiles and docker-compose (done in this repo as a starting point)
2. **Kubernetes** — deploy the containerized app to a cluster (manifests or Helm chart)
3. **CI pipeline** — build, test, lint, and security-scan on every push
4. **Container registry** — publish built images
5. **Continuous delivery** — Argo CD watching the cluster and syncing from Git
6. **Infrastructure as Code** — provision the cluster and supporting infra with Terraform
7. **Configuration management** — Ansible for any remaining host-level configuration
8. **Security scanning** — Trivy (or similar) in the pipeline
9. **Observability** — metrics, logs, and alerting for real deployments

---

## 15. Testing Summary

Backend tests cover: application creation, retrieval, update, deletion, duplicate-name rejection,
deployment creation with pipeline stages, deployment retrieval, filtering deployments by
application, and invalid-application rejection. Run them with `mvn test` from `backend/`.

# ShopSmart Full-Stack CRUD Application

Production-ready full-stack task manager built with Express, Prisma, SQLite, and React.

## Tech Stack

- Backend: Node.js + Express
- Database: SQLite3
- ORM: Prisma
- Frontend: React (functional components + hooks)
- Styling: Custom responsive CSS
- Testing:
  - Unit: Jest
  - Integration: Supertest
  - E2E (bonus): Playwright
- CI/CD: GitHub Actions
- Deployment Target: AWS EC2 via SSH + PM2

## Architecture

### Backend (`/server`)

Layered architecture for maintainability and testability:

- `src/routes`: REST route definitions
- `src/controllers`: HTTP request/response orchestration
- `src/services`: business logic + Prisma operations
- `src/validators`: input validation and normalization
- `src/middleware`: async handling, 404, centralized error handling
- `src/db`: Prisma client bootstrap

### Database (`/prisma`)

- `schema.prisma`: SQLite datasource + `Task` model
- `migrations`: tracked SQL migrations
- `seed.js`: idempotent seed data

### Frontend (`/client`)

- Reusable components: `TaskForm`, `TaskList`, `TaskItem`
- `useTasks` hook for data fetching and mutations
- API abstraction in `src/api/tasksApi.js`
- Responsive UI with accessible labels and clear states

### Tests (`/tests` and `/server/tests`, `/client/src/__tests__`)

- Server unit tests for validation and service logic
- Server integration tests for full CRUD with Supertest + SQLite
- Client unit/component tests with Jest + Testing Library
- Bonus Playwright E2E flow in `tests/e2e/tasks.e2e.spec.js`

## REST API

Base routes: `/tasks` and `/api/tasks`

- `POST /tasks` -> create task
- `GET /tasks` -> get all tasks
- `GET /tasks/:id` -> get one task
- `PUT /tasks/:id` -> update task
- `DELETE /tasks/:id` -> delete task

Health route:

- `GET /api/health`

## Project Structure

```text
/client
/server
/prisma
/tests
/.github/workflows
```

## Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=5001
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=file:./dev.db
VITE_API_URL=
```

Notes:

- Leave `VITE_API_URL` empty in local development to use Vite proxy.
- SQLite files are created under `/prisma` by Prisma.

## Local Development

### 1) Install dependencies

```bash
npm ci
npm run install:all
```

### 2) Generate Prisma client + run migrations

```bash
npm run prisma:generate --prefix server
npm run prisma:migrate:dev --prefix server
```

### 3) Optional seed

```bash
npm run prisma:seed --prefix server
```

### 4) Start backend and frontend

Terminal 1:

```bash
npm run dev --prefix server
```

Terminal 2:

```bash
npm run dev --prefix client
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

## Testing

### Run all tests

```bash
npm run test
```

### Run by type

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Linting and Formatting

```bash
npm run lint
npm run format:check
```

CI blocks merges when linting/tests fail.

## CI/CD Workflow

### CI (`.github/workflows/ci.yml`)

Triggers on:

- `push`
- `pull_request`

Pipeline steps:

1. Install dependencies (root + client + server)
2. Generate Prisma client and run migrations
3. Run ESLint
4. Run Prettier checks
5. Run all tests

### Deployment (`.github/workflows/deploy-ec2.yml`)

Triggers on:

- push to `main`
- manual `workflow_dispatch`

Deployment flow:

1. SSH into EC2 with GitHub Action
2. Clone/pull latest branch code
3. Install server/client dependencies (`npm ci`)
4. Run Prisma generate + migrations
5. Start/restart backend using PM2
6. Build frontend and sync static assets to web root

Required GitHub Secrets:

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- Optional: `EC2_APP_DIR`, `EC2_WEB_ROOT`, `EC2_REPO_URL`

## Dependabot

Configured in `.github/dependabot.yml` for:

- root npm dependencies
- `/server` npm dependencies
- `/client` npm dependencies
- GitHub Actions dependencies

## Idempotent Scripts

- `scripts/setup.sh`: safe repeated local setup (`mkdir -p`, deterministic installs, migration-safe)
- `scripts/deploy-ec2.sh`: safe repeated deployment logic (clone-if-missing, pull/update, PM2 restart-or-start)
- Wrappers:
  - `./dev-setup.sh`
  - `./deploy.sh`

## Commit Guidelines

- Commit frequently in small, logical units.
- Keep each commit focused on one concern (for example: API routes, frontend UI, CI config).
- Prefer descriptive commit messages (for example: `feat(server): add tasks CRUD service`).
- Avoid end-of-day bulk commits that mix unrelated changes.

## Design Decisions

- Used layered backend architecture for clear separation of concerns.
- Used Prisma migrations to keep schema changes reproducible and auditable.
- Used a dedicated API layer + custom hook on frontend to keep UI components focused on rendering.
- Added centralized error handling for consistent API responses.
- Added root-level scripts to keep CI and local commands consistent.

## Challenges and Solutions

- Challenge: keeping API validation strict without bloating controllers.
  - Solution: moved validation into dedicated validator module.
- Challenge: reliable test DB setup for integration tests.
  - Solution: `test:prepare` script resets and pushes schema safely before tests.
- Challenge: repeatable EC2 deploy process.
  - Solution: idempotent deploy script with clone/pull checks and PM2 restart/start fallback.

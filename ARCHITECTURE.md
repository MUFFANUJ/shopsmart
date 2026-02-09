# ShopSmart — Architecture & Design Document

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     GitHub Actions                       │
│  ┌──────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │CI/CD │ │ Lint PR  │ │ Matrix   │ │ Deploy EC2    │  │
│  │      │ │ Checks   │ │ Testing  │ │ (SSH + PM2)   │  │
│  └──┬───┘ └────┬─────┘ └────┬─────┘ └──────┬────────┘  │
└─────┼──────────┼────────────┼───────────────┼───────────┘
      │          │            │               │
      ▼          ▼            ▼               ▼
┌─────────────────────┐           ┌────────────────────┐
│   Client (React)    │  ◄─API─►  │   Server (Express) │
│   Vite + JSX        │           │   Prisma ORM       │
│   Port 5173         │           │   Port 5001        │
└─────────────────────┘           └────────┬───────────┘
                                           │
                                  ┌────────▼───────────┐
                                  │  SQLite Database    │
                                  │  (dev.db)           │
                                  └────────────────────┘
```

### Frontend (React + Vite)
- **Framework**: React 18 with Vite 5 as the build tool (fast HMR, optimized bundling)
- **Styling**: Vanilla CSS with a custom design system (800+ lines) — no utility-class framework
- **Components**: 10 functional components following single-responsibility principle
- **State Management**: React `useState` + `useEffect` in the root `App.jsx` — kept simple since the app is single-page
- **API Communication**: Native `fetch()` with Vite's dev proxy for `/api` → `localhost:5001`

### Backend (Express.js)
- **Framework**: Express 4 with RESTful API design
- **ORM**: Prisma with SQLite — chosen for zero-config local development (no DB server needed)
- **API Endpoints**: Full CRUD on `/api/products` with search, category filter, and input validation
- **Graceful Shutdown**: SIGTERM/SIGINT handlers that properly disconnect the Prisma client

### Database (SQLite via Prisma)
- **Why SQLite**: No external database server to install/configure — the DB is a single file (`dev.db`)
- **Why Prisma**: Type-safe queries, auto-generated client, built-in migration & seed support
- **Schema**: Single `Product` model with fields: id, name, price, category, inStock, description, createdAt, updatedAt

---

## 2. CI/CD Workflow Design

We have **8 GitHub Actions workflows**, each with a distinct purpose:

| Workflow | Trigger | Rationale |
|----------|---------|-----------|
| **ci.yml** | push/PR to main | Core pipeline — install, lint, test, build for both client and server |
| **lint.yml** | PR to main | Dedicated lint gate — ESLint + Prettier checks that block merge on failure |
| **unit-integration.yaml** | push/PR | Runs unit tests (client) and integration tests with a live server |
| **server-matrix-test.yaml** | push/PR | Tests server on Node 18/20/22 to ensure compatibility |
| **deploy-ec2.yaml** | push to main | Automated EC2 deployment via SSH — pulls, installs, restarts PM2 |
| **deploy-pages.yml** | push to main | Builds client and deploys static assets to GitHub Pages |
| **variables-secrets-artifacts.yaml** | push/manual | Demonstrates environment variables, secrets, and build artifacts |
| **recap.yaml** | manual | Simple workflow_dispatch demo |

**Design Decision**: We separate CI (testing/linting) from CD (deployment) so that tests must pass before any deployment occurs. The matrix testing workflow ensures our server works across multiple Node.js versions.

---

## 3. Testing Strategy

We follow the **testing pyramid** approach:

```
        ┌─────────┐
        │  E2E    │  ← 2 Playwright specs, 15+ tests
        │(Costly) │     Simulates real user flows in browser
        ├─────────┤
        │ Integra-│  ← Jest + Supertest (server API tests)
        │  tion   │     Tests API ↔ Database interaction
        ├─────────┤
        │  Unit   │  ← Vitest (client components + utils)
        │ (Fast)  │     Tests individual functions/components
        └─────────┘
```

### Unit Tests (Client — Vitest)
- `App.test.jsx` — Renders navbar, hero, footer, cart interaction
- `ProductCard.test.jsx` — Renders product data, stock badges, add-to-cart callback
- `ProductList.test.jsx` — API fetch mock, search interaction, error/empty states
- `SearchBar.test.jsx` — Input update, form submission, clear functionality
- `utils.test.js` — Pure function tests: `formatPrice`, `formatDate`, `filterByCategory`, `getStockLabel`

### Integration Tests (Server — Jest + Supertest)
- Tests the full request lifecycle: Express route → Prisma ORM → SQLite → response
- Covers all CRUD operations: POST (create + validation), GET (all + by ID + 404), PUT (update), DELETE (delete + verify)
- Health check endpoint verification

### E2E Tests (Playwright)
- `homepage.spec.js` — Page load, navbar, hero, footer, cart drawer
- `products.spec.js` — Product rendering, search filter, add-to-cart flow, toast notifications, cart badge, product modal, category filter

**Why Playwright over Cypress**: Playwright supports multiple browsers, has built-in `webServer` config to auto-start both frontend and backend, and has better parallel execution.

---

## 4. Deployment Architecture

### AWS EC2 (Production)
```
GitHub Actions → SSH into EC2 → git pull → npm install → PM2 restart
```
- **Process Manager**: PM2 handles auto-restart on crash, log management, and process persistence
- **Web Server**: Nginx serves the built client from `/var/www/html/` and proxies API requests to PM2
- **Secrets**: EC2 host, username, and SSH key stored as GitHub repository secrets

### GitHub Pages (Static Frontend)
- Builds the React app and deploys the `dist/` folder
- Uses GitHub's official `actions/deploy-pages@v4`

---

## 5. Idempotent Script Design

Both `dev-setup.sh` and `deploy.sh` are designed to produce the **same result regardless of how many times they're run**:

| Pattern | Example | Why |
|---------|---------|-----|
| `mkdir -p` | `mkdir -p "$APP_DIR"` | Creates dir only if it doesn't exist |
| `command -v` | `if ! command -v pm2 &> /dev/null` | Check before installing |
| Conditional install | `if [ ! -d "node_modules" ]` | Skip npm install if already done |
| PM2 describe | `if pm2 describe shopsmart-server > /dev/null` | Restart if running, start if not |
| `set -e` | Top of both scripts | Exit on any error — prevents partial state |
| `cp -r` | `sudo cp -r dist/* /var/www/html/` | Overwrites existing files safely |

**Anti-pattern avoided**: Using `mkdir project` (fails on second run) — we always use `mkdir -p project`.

---

## 6. Linting & Code Quality

- **ESLint (Client)**: `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` for React-specific rules
- **ESLint (Server)**: `eslint:recommended` with Node.js environment, `no-unused-vars` as warning
- **Prettier**: Consistent formatting — single quotes, trailing commas, 2-space tabs, 100 char line width
- **Pre-commit Hooks**: `.pre-commit-config.yaml` with `check-added-large-files` to prevent accidental binary commits
- **PR Gate**: Dedicated `lint.yml` workflow blocks merges if code doesn't pass ESLint/Prettier checks

---

## 7. Dependency Management

- **Dependabot** (`.github/dependabot.yml`):
  - Checks npm dependencies for both `client/` and `server/` weekly
  - Checks GitHub Actions versions weekly
  - Auto-creates labeled PRs: `dependencies`, `frontend`/`backend`/`ci`
  - Limit: 10 open PRs per ecosystem to avoid PR flood

---

## 8. Challenges & Solutions

| Challenge | Root Cause | Solution |
|-----------|-----------|----------|
| CORS in development | Client (5173) and server (5001) on different ports | Vite proxy config + Express CORS middleware |
| Database in CI | No persistent DB in GitHub Actions | `prisma db push` with `file:./test.db` creates ephemeral SQLite |
| E2E test timing | Server/client not ready when tests start | Playwright's `webServer` config auto-starts both, waits for ready |
| PM2 restart vs start | `pm2 restart` fails if process doesn't exist | `pm2 describe` check before deciding restart or start |
| Consistent formatting | Multiple developers with different editor configs | Prettier + `.prettierrc` + CI check enforces team-wide consistency |
| Package version drift | Dependencies silently break on minor updates | Dependabot catches outdated deps before they become security issues |

# DevOps Implementation Guide
This document provides a comprehensive explanation of the DevOps practices implemented in this repository, addressing all elements evaluated in the grading rubric. It details **what** was implemented, **why** it was implemented, and **how it helps**.

---

## 1. Regularity – Commit History
**What we implemented:**
The repository features frequent, meaningful commits (`git log` shows granular commits across frontend, backend, testing, and CI configurations). Changes are separated logically (e.g., "fix: resolve E2E strict mode", "feat: Configure ESLint", "added workflows").
**Why we implemented it:**
Good version control practices require granular, logical changes rather than "last-day bulk commits".
**What it helps with:**
It ensures changes are traceable, makes rollbacks easier if a specific feature breaks the code, and demonstrates a consistent development effort over time.

---

## 2. GitHub Workflows / CI
**What we implemented:**
We created automated CI/CD pipelines in `.github/workflows/` (`unit-integration.yaml`, `lint.yml`, `server-matrix-test.yaml`). They trigger automatically on `push` and `pull_request` to the main/feature branches.
The workflows include steps to:
- Install dependencies (`npm ci`)
- Run unit/integration tests (`npm test`, `vitest`)
- Run linters (`npm run lint`)
**Why we implemented it:**
To automate the integration process and catch errors before code is merged.
**What it helps with:**
Continuous Integration (CI) guarantees that new code combinations don't break existing functionality and adhere to coding standards without manual intervention.

---

## 3. Frontend Implementation
**What we implemented:**
A clean and responsive React application located in the `client/` directory with functional components (`App.jsx`, `components/`), utilizing CSS (`index.css`), and making API calls to the server.
**Why we implemented it:**
To provide a structured layout and reusable UI components.
**What it helps with:**
Ensures modularity (reusable components) and a separation of concerns between structure, styling, and logic.

---

## 4. Unit Testing
**What we implemented:**
We added unit tests for individual components/functions. The backend utilizes **Jest** (`server/package.json`), while the frontend utilizes **Vitest/React Testing Library** (`client/package.json`).
**Why we implemented it:**
To ensure individual, isolated pieces of code (like a single utility function or a single React component) work exactly as expected.
**What it helps with:**
It acts as the first line of defense against bugs, allowing developers to refactor with confidence knowing that baseline functionality is preserved.

---

## 5. Integration Testing
**What we implemented:**
We used Jest alongside `supertest` to test interactions between modules, specifically the **API + Database** integration (bootstrapping test databases and seeding data via Prisma).
**Why we implemented it:**
Unit tests don't guarantee that different modules work correctly *together*. Integration tests validate these connections.
**What it helps with:**
It ensures system-level interactions (like a user hitting an endpoint naturally creating a database record) behave correctly, validating the true architecture boundaries.

---

## 6. E2E Testing (Extra Bonus)
**What we implemented:**
We configured **Playwright** (`client/package.json` -> `test:e2e`) to perform End-to-End tests simulating real user flows in a browser environment.
**Why we implemented it:**
To ensure the entire stack (Frontend -> Network -> API -> Database) works harmoniously from a user's perspective.
**What it helps with:**
E2E testing is the ultimate proof of a working application, demonstrating production-level readiness and guaranteeing that user workflows (like login -> action -> result) succeed.

---

## 7. PR Checks (Linting)
**What we implemented:**
We configured a dedicated GitHub workflow (`lint.yml`) that triggers on `pull_request`. It utilizes **ESLint** on both the client and server. If the linting fails, the PR check fails.
**Why we implemented it:**
To enforce code quality and stylistic consistency automatically.
**What it helps with:**
It prevents "bad code" or code with syntax violations/bad practices from being merged into the master branch, maintaining a high-quality codebase.

---

## 8. Dependabot Configuration
**What we implemented:**
We created `.github/dependabot.yml` configured to automatically check for outdated `npm` dependencies weekly in both `/client` and `/server`, as well as checking `github-actions`.
**Why we implemented it:**
Dependency versions age rapidly, often leading to security vulnerabilities.
**What it helps with:**
It automatically generates Pull Requests to update dependencies securely, keeping the software patched and reducing technical debt without manual auditing.

---

## 9. Execute Commands on AWS EC2 + GitHub Integration
**What we implemented:**
We defined a GitHub Actions workflow (`deploy-ec2.yaml`) that uses SSH credentials (`appleboy/ssh-action`) stored in GitHub Secrets. It connects to an AWS EC2 instance, pulls the latest code, installs dependencies, and restarts the Node process using `PM2`.
**Why we implemented it:**
To bridge the gap between GitHub (version control) and AWS (hosting infrastructure).
**What it helps with:**
Achieves *Full Automated Deployment*. Developers can push code, and the latest version goes live to the EC2 server reliably, without needing manual SSH intervention.

---

## 10. Idempotent Scripts
**What we implemented:**
Bash scripts like `dev-setup.sh` and `lab_activity/safe-ec2-control.sh` follow idempotent methodologies. For example, `dev-setup.sh` checks if Node is installed before attempting to install, and uses `mkdir -p` to safely create directories regardless of whether they exist.
**Why we implemented it:**
Scripts need to be safely runnable multiple times without throwing errors or causing unintended side effects (like duplicating data or crashing).
**What it helps with:**
Idempotency ensures predictable infrastructure behavior. An operator can confidently run a script over and over, knowing the end state will always securely result in the desired configuration.

---

## 11. Architecture & Design Decisions (Explanation)
**Architecture Pipeline Recap:**
- **Code:** React (Frontend) + Express/Node (Backend)
- **Database:** SQLite managed via Prisma ORM for simplified migrations.
- **CI/CD:** GitHub Actions sequentially checks linting, runs unit/integration tests, runs Playwright E2E tests, and finally (on trigger) deploys to an AWS EC2 instance via SSH.
- **Workflow:** Code is checked on PR creation. On successful merge, it passes E2E strict mode tests before deployment.
**Challenges:**
Maintaining environment parity across testing scopes (e.g., seeding a clean DB state before E2E tests using `.env.test`) was a notable challenge solved through precise GitHub Action sequential steps (`unit-integration.yaml`).

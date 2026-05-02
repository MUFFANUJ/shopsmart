# ─────────────────────────────────────────────────────────────
# Stage 1: Build
# Installs all deps, generates Prisma client, seeds DB
# ─────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Prisma on bookworm-slim needs OpenSSL available during client generation.
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Copy server package files and install
COPY server/package*.json ./
RUN npm ci

# Copy server source
COPY server/ ./

# Copy prisma from root (prisma/ is at repo root, not in server/)
COPY prisma/ ./prisma/

# Needed for prisma db push during image build.
ENV DATABASE_URL="file:./dev.db"

# Generate Prisma client (uses binaryTargets we set in schema.prisma)
# Push schema to SQLite and seed
RUN npx prisma generate && \
    npx prisma db push && \
    node prisma/seed.js

# ─────────────────────────────────────────────────────────────
# Stage 2: Runtime
# Lean production image — no dev tools, non-root user
# ─────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime

# curl needed for healthcheck; create non-root user
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl openssl && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Remove dev dependencies to shrink image
RUN npm prune --omit=dev

COPY --from=build /app/src ./src
COPY --from=build /app/prisma ./prisma

# Prisma writes dev.db inside prisma/ folder
COPY --from=build /app/prisma/dev.db ./dev.db

# Give non-root user ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5001

# ECS uses this healthcheck to decide when the container is ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:5001/api/health || exit 1

CMD ["node", "src/index.js"]

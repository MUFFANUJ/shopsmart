# DevOps Final Phase — Complete Step-by-Step Guide

> Written for the **ShopSmart** repo (`github.com/MUFFANUJ/shopsmart`).  
> Every command, every file, every AWS console screen — explained from scratch.

---

## Table of Contents

1. [Understand the Repo Structure](#1-understand-the-repo-structure)
2. [What You Are Building](#2-what-you-are-building)
3. [Tools You Need Installed](#3-tools-you-need-installed)
4. [Step 1 — Get AWS Credentials from AWS Academy](#4-step-1--get-aws-credentials-from-aws-academy)
5. [Step 2 — Add GitHub Secrets](#5-step-2--add-github-secrets)
6. [Step 3 — Create the Folder Structure](#6-step-3--create-the-folder-structure)
7. [Step 4 — Fix schema.prisma for Linux](#7-step-4--fix-schemaprisma-for-linux)
8. [Step 5 — Write the Dockerfile](#8-step-5--write-the-dockerfile)
9. [Step 6 — Write the Terraform Files](#9-step-6--write-the-terraform-files)
10. [Step 7 — Write the verify-ecs.sh Script](#10-step-7--write-the-verify-ecssh-script)
11. [Step 8 — Write the clean.sh Script](#11-step-8--write-the-cleansh-script)
12. [Step 9 — Write the GitHub Actions Pipeline](#12-step-9--write-the-github-actions-pipeline)
13. [Step 10 — Test Everything Locally First](#13-step-10--test-everything-locally-first)
14. [Step 11 — Verify on AWS Console](#14-step-11--verify-on-aws-console)
15. [Step 12 — Push to GitHub and Trigger Pipeline](#15-step-12--push-to-github-and-trigger-pipeline)
16. [Step 13 — Verify Pipeline on AWS Console](#16-step-13--verify-pipeline-on-aws-console)
17. [Cleanup](#17-cleanup)
18. [Troubleshooting](#18-troubleshooting)
19. [What If Your Repo Is Different?](#19-what-if-your-repo-is-different)

---

## 1. Understand the Repo Structure

The ShopSmart repo looks like this **before** you add anything:

```
shopsmart/
├── client/                  ← React frontend
├── server/                  ← Node.js + Express backend
│   ├── src/
│   │   └── index.js         ← entry point, runs on port 5001
│   └── package.json
├── prisma/                  ← Prisma schema at ROOT (not inside server/)
│   ├── schema.prisma        ← YOU WILL EDIT THIS
│   ├── migrations/
│   └── seed.js
├── tests/                   ← integration/e2e tests
├── .github/
│   └── workflows/           ← YOU WILL ADD a new workflow here
└── package.json             ← root package.json with test scripts
```

> **Important:** In this repo, `prisma/` is at the **root level**, not inside `server/`. The Dockerfile must account for this.

---

## 2. What You Are Building

You will add a `final-phase/` folder to the repo containing everything needed to deploy the backend to AWS ECS Fargate via a 3-phase GitHub Actions pipeline:

```
shopsmart/
├── final-phase/             ← YOU CREATE THIS
│   ├── Dockerfile
│   ├── Dockerfile.dockerignore
│   ├── scripts/
│   │   ├── verify-ecs.sh
│   │   └── clean.sh
│   └── terraform/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── providers.tf
│       └── versions.tf
└── .github/
    └── workflows/
        └── final-phase-pipeline.yml   ← YOU CREATE THIS
```

**The 3 pipeline phases:**

| Phase | What it does |
|-------|-------------|
| Phase 1 — Tests | Runs unit + integration tests, uploads test report |
| Phase 2 — Terraform | Creates S3 bucket, ECR repo, ECS cluster, security group, CloudWatch logs |
| Phase 3 — Deploy | Builds Docker image, pushes to ECR, deploys to ECS Fargate, verifies health |

---

## 3. Tools You Need Installed

Check each one is installed before starting:

```bash
aws --version        # AWS CLI
terraform --version  # Terraform
docker --version     # Docker Desktop
node --version       # Node.js (should be 20+)
git --version        # Git
```

If anything is missing:
- AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
- Terraform: https://developer.hashicorp.com/terraform/install
- Docker Desktop: https://www.docker.com/products/docker-desktop

---

## 4. Step 1 — Get AWS Credentials from AWS Academy

Every time you start a new lab session, you need fresh credentials.

### How to get them — follow exactly:

1. Go to **https://awsacademy.instructure.com** and log in
2. Click your course → **Modules** → **Learner Lab**
3. Click **Start Lab** (green button top right)
4. Wait until the dot next to **AWS** turns **green** (takes ~1-2 min)
5. Click **AWS Details** (button at the top)
6. Click **Show** next to **"AWS CLI:"**

You will see a block like this — **copy everything inside it**:

```
[default]
aws_access_key_id=ASIA4EXAMPLE12345678
aws_secret_access_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
aws_session_token=IQoJb3JpZ2luX2VjEJr....(very long string, hundreds of characters)....
```

> These expire when your lab session ends. Every new session = new credentials.

### Paste them into AWS CLI config:

Open your terminal and run these **one line at a time**, replacing with your actual values:

```bash
aws configure set aws_access_key_id     ASIA4EXAMPLE12345678
aws configure set aws_secret_access_key wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
aws configure set aws_session_token     IQoJb3JpZ2luX2VjEJr....
aws configure set default.region        us-east-1
```

Verify it works:

```bash
aws sts get-caller-identity
```

You should see your account ID. Example:

```json
{
    "UserId": "AROA...",
    "Account": "443325993463",
    "Arn": "arn:aws:sts::443325993463:assumed-role/..."
}
```

Note your **Account ID** (the number) — you'll need it later.

---

## 5. Step 2 — Add GitHub Secrets

These secrets let GitHub Actions authenticate to AWS on your behalf.

### How to add them:

1. Go to your GitHub repo in the browser
2. Click the **Settings** tab (top of repo — not your profile settings)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. For each secret below, click **New repository secret**, enter the name and value, click **Add secret**

| Secret Name | Where to get the value |
|-------------|----------------------|
| `AWS_ACCESS_KEY_ID` | From AWS Academy Details → the `aws_access_key_id=` line |
| `AWS_SECRET_ACCESS_KEY` | From AWS Academy Details → the `aws_secret_access_key=` line |
| `AWS_SESSION_TOKEN` | From AWS Academy Details → the `aws_session_token=` line (the very long one) |
| `AWS_REGION` | Type literally: `us-east-1` |

After adding all four, the Secrets page should show:

```
Repository secrets (4)
  AWS_ACCESS_KEY_ID        Updated just now
  AWS_SECRET_ACCESS_KEY    Updated just now
  AWS_SESSION_TOKEN        Updated just now
  AWS_REGION               Updated X days ago
```

> **Every new lab session:** The AWS token/key/secret all expire. Go back and update the three AWS secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`) with the fresh values from AWS Details. `AWS_REGION` never changes.

---

## 6. Step 3 — Create the Folder Structure

Run these commands from the **root of your cloned repo**:

```bash
mkdir -p final-phase/scripts
mkdir -p final-phase/terraform
```

---

## 7. Step 4 — Fix schema.prisma for Linux

This is the most commonly missed step. Without it, the container will crash on ECS every time.

**Why this matters:** When Prisma generates on your Mac, it creates a query engine binary compiled for macOS. ECS Fargate runs Debian Linux with OpenSSL 3.0.x. The Mac binary doesn't work on Linux. Adding `binaryTargets` tells Prisma to also include the Linux binary.

Open `prisma/schema.prisma` (at the root of the repo) and change the `generator client` block:

**Before:**
```prisma
generator client {
  provider = "prisma-client-js"
}
```

**After:**
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

Save and close. That's the only change needed in this file.

---

## 8. Step 5 — Write the Dockerfile

Create `final-phase/Dockerfile`:

```dockerfile
# ─────────────────────────────────────────────────────────────
# Stage 1: Build
# Installs all deps, generates Prisma client, seeds DB
# ─────────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS build

WORKDIR /app

# Copy server package files and install
COPY server/package*.json ./
RUN npm ci

# Copy server source
COPY server/ ./

# Copy prisma from root (prisma/ is at repo root, not in server/)
COPY prisma/ ./prisma/

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
    apt-get install -y --no-install-recommends curl && \
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
```

Create `final-phase/Dockerfile.dockerignore`:

```
node_modules
.git
*.md
final-phase/terraform
final-phase/scripts
client
tests
```

---

## 9. Step 6 — Write the Terraform Files

Create all 5 files inside `final-phase/terraform/`.

### `final-phase/terraform/versions.tf`

```hcl
terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}
```

### `final-phase/terraform/providers.tf`

```hcl
provider "aws" {
  region = var.aws_region
}
```

### `final-phase/terraform/variables.tf`

```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "deploy_ecs_service" {
  description = "Set true only after Docker image is in ECR"
  type        = bool
  default     = false
}

variable "container_image" {
  description = "Full ECR image URI. Example: 123456.dkr.ecr.us-east-1.amazonaws.com/my-repo:latest"
  type        = string
  default     = ""
}

variable "ecs_execution_role_arn" {
  description = "IAM role ARN for ECS. Use LabRole for AWS Academy."
  type        = string
  default     = ""
}
```

### `final-phase/terraform/main.tf`

```hcl
locals {
  create_ecs_service = (
    var.deploy_ecs_service &&
    var.container_image != "" &&
    var.ecs_execution_role_arn != ""
  )
}

resource "random_string" "stack_suffix" {
  length  = 6
  upper   = false
  special = false
}

resource "random_string" "bucket_suffix" {
  length  = 8
  upper   = false
  special = false
}

locals {
  stack_name = "shopsmart-final-${random_string.stack_suffix.result}"
}

data "aws_vpc" "default" {
  count   = 1
  default = true
}

data "aws_subnets" "default" {
  count = 1
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default[0].id]
  }
}

# S3 — rubric: unique name, versioning, encryption, no public access
resource "aws_s3_bucket" "rubric_bucket" {
  bucket        = "shopsmart-final-artifacts-${random_string.bucket_suffix.result}"
  force_destroy = true
  tags = {
    Name      = "shopsmart-final-artifacts-${random_string.bucket_suffix.result}"
    ManagedBy = "terraform"
  }
}

resource "aws_s3_bucket_versioning" "rubric_bucket_versioning" {
  bucket = aws_s3_bucket.rubric_bucket.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "rubric_bucket_encryption" {
  bucket = aws_s3_bucket.rubric_bucket.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_public_access_block" "rubric_bucket_public_block" {
  bucket                  = aws_s3_bucket.rubric_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ECR
resource "aws_ecr_repository" "app" {
  name                 = "${local.stack_name}-repo"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
  tags = { Name = "${local.stack_name}-repo", ManagedBy = "terraform" }
}

# ECS Cluster
resource "aws_ecs_cluster" "app" {
  name = "${local.stack_name}-cluster"
  tags = { Name = "${local.stack_name}-cluster", ManagedBy = "terraform" }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${local.stack_name}"
  retention_in_days = 7
  tags = { Name = "/ecs/${local.stack_name}", ManagedBy = "terraform" }
}

# Security Group
resource "aws_security_group" "ecs_service" {
  name        = "${local.stack_name}-sg"
  description = "Allow app traffic to ECS task"
  vpc_id      = data.aws_vpc.default[0].id

  ingress {
    description = "App port"
    from_port   = 5001
    to_port     = 5001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.stack_name}-sg", ManagedBy = "terraform" }
}

# ECS Task Definition (only when deploy_ecs_service=true)
resource "aws_ecs_task_definition" "app" {
  count                    = local.create_ecs_service ? 1 : 0
  family                   = "${local.stack_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = var.ecs_execution_role_arn

  container_definitions = jsonencode([{
    name      = "shopsmart-server"
    image     = var.container_image
    essential = true
    portMappings = [{ containerPort = 5001, hostPort = 5001, protocol = "tcp" }]
    environment = [
      { name = "DATABASE_URL", value = "file:./dev.db" },
      { name = "PORT",         value = "5001" }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${local.stack_name}"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:5001/api/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 20
    }
  }])

  tags = { Name = "${local.stack_name}-task", ManagedBy = "terraform" }
}

# ECS Service
resource "aws_ecs_service" "app" {
  count           = local.create_ecs_service ? 1 : 0
  name            = "${local.stack_name}-service"
  cluster         = aws_ecs_cluster.app.id
  task_definition = aws_ecs_task_definition.app[0].arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.default[0].ids
    security_groups  = [aws_security_group.ecs_service.id]
    assign_public_ip = true
  }

  tags = { Name = "${local.stack_name}-service", ManagedBy = "terraform" }
}
```

### `final-phase/terraform/outputs.tf`

```hcl
output "stack_name" {
  value = local.stack_name
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.app.name
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs_service.id
}

output "s3_bucket_name" {
  value = aws_s3_bucket.rubric_bucket.id
}

output "selected_subnet_ids" {
  value = data.aws_subnets.default[0].ids
}

output "ecs_service_name" {
  value = local.create_ecs_service ? aws_ecs_service.app[0].name : null
}
```

---

## 10. Step 7 — Write the verify-ecs.sh Script

Create `final-phase/scripts/verify-ecs.sh`:

```bash
#!/bin/bash
# Waits for the ECS service to become stable and prints status.
# Required env vars: AWS_REGION, ECS_CLUSTER_NAME, ECS_SERVICE_NAME

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"

if [ -z "$ECS_CLUSTER_NAME" ] || [ -z "$ECS_SERVICE_NAME" ]; then
  echo "Error: ECS_CLUSTER_NAME and ECS_SERVICE_NAME must be set."
  exit 1
fi

echo "Waiting for ECS service to become stable..."
aws ecs wait services-stable \
  --cluster "$ECS_CLUSTER_NAME" \
  --services "$ECS_SERVICE_NAME" \
  --region "$AWS_REGION"

echo "Fetching final ECS service state..."
aws ecs describe-services \
  --cluster "$ECS_CLUSTER_NAME" \
  --services "$ECS_SERVICE_NAME" \
  --region "$AWS_REGION" \
  --output table \
  --query 'services[0].{desiredCount:desiredCount,pendingCount:pendingCount,runningCount:runningCount,status:status,taskDefinition:taskDefinition}'

echo "ECS verification complete."
```

```bash
chmod +x final-phase/scripts/verify-ecs.sh
```

---

## 11. Step 8 — Write the clean.sh Script

Create `final-phase/scripts/clean.sh`:

```bash
#!/bin/bash
# Destroys all AWS resources created by the final-phase pipeline.
# Run this before re-triggering the pipeline to avoid "already exists" errors.
# Usage: bash final-phase/scripts/clean.sh

set -e

REGION="${AWS_REGION:-us-east-1}"
TF_DIR="$(cd "$(dirname "$0")/../terraform" && pwd)"

echo "=========================================="
echo "  ShopSmart Final Phase — Cleanup"
echo "  Region: $REGION"
echo "=========================================="

# 1. Scale ECS services to 0
echo ""
echo "→ Stopping ECS services..."
CLUSTERS=$(aws ecs list-clusters --region "$REGION" \
  --query 'clusterArns[]' --output text 2>/dev/null || echo "")

for CLUSTER_ARN in $CLUSTERS; do
  CLUSTER_NAME=$(basename "$CLUSTER_ARN")
  if [[ "$CLUSTER_NAME" == *"shopsmart-final"* ]]; then
    SERVICES=$(aws ecs list-services --cluster "$CLUSTER_NAME" \
      --region "$REGION" --query 'serviceArns[]' --output text 2>/dev/null || echo "")
    for SERVICE_ARN in $SERVICES; do
      SERVICE_NAME=$(basename "$SERVICE_ARN")
      echo "  Scaling down: $SERVICE_NAME"
      aws ecs update-service --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" \
        --desired-count 0 --region "$REGION" > /dev/null 2>&1 || true
    done
  fi
done
sleep 15

# 2. Empty S3 buckets
echo ""
echo "→ Emptying S3 buckets..."
BUCKETS=$(aws s3api list-buckets \
  --query 'Buckets[?starts_with(Name, `shopsmart-final`)].Name' \
  --output text 2>/dev/null || echo "")

for BUCKET in $BUCKETS; do
  if [ -n "$BUCKET" ] && [ "$BUCKET" != "None" ]; then
    echo "  Emptying: $BUCKET"
    aws s3 rm "s3://$BUCKET" --recursive --region "$REGION" > /dev/null 2>&1 || true

    VERSIONS=$(aws s3api list-object-versions --bucket "$BUCKET" \
      --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' \
      --output json 2>/dev/null || echo '{"Objects":[]}')
    if echo "$VERSIONS" | grep -q '"Key"'; then
      aws s3api delete-objects --bucket "$BUCKET" --delete "$VERSIONS" \
        --region "$REGION" > /dev/null 2>&1 || true
    fi

    MARKERS=$(aws s3api list-object-versions --bucket "$BUCKET" \
      --query '{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' \
      --output json 2>/dev/null || echo '{"Objects":[]}')
    if echo "$MARKERS" | grep -q '"Key"'; then
      aws s3api delete-objects --bucket "$BUCKET" --delete "$MARKERS" \
        --region "$REGION" > /dev/null 2>&1 || true
    fi
  fi
done

# 3. Terraform destroy
echo ""
echo "→ Running terraform destroy..."
if [ -f "$TF_DIR/terraform.tfstate" ]; then
  cd "$TF_DIR"
  terraform init -reconfigure > /dev/null 2>&1
  terraform destroy -auto-approve \
    -var="deploy_ecs_service=false" \
    -var="aws_region=$REGION" || echo "⚠️  Some resources may need manual cleanup."
else
  echo "  No local terraform.tfstate found — skipping terraform destroy."
fi

# 4. Force-delete remaining ECR repos
echo ""
echo "→ Cleaning up ECR repositories..."
REPOS=$(aws ecr describe-repositories --region "$REGION" \
  --query 'repositories[?starts_with(repositoryName, `shopsmart-final`)].repositoryName' \
  --output text 2>/dev/null || echo "")
for REPO in $REPOS; do
  if [ -n "$REPO" ] && [ "$REPO" != "None" ]; then
    echo "  Deleting: $REPO"
    aws ecr delete-repository --repository-name "$REPO" --force \
      --region "$REGION" > /dev/null 2>&1 || true
  fi
done

# 5. Delete CloudWatch log groups
echo ""
echo "→ Cleaning up CloudWatch log groups..."
LOG_GROUPS=$(aws logs describe-log-groups \
  --log-group-name-prefix "/ecs/shopsmart-final" --region "$REGION" \
  --query 'logGroups[].logGroupName' --output text 2>/dev/null || echo "")
for LG in $LOG_GROUPS; do
  if [ -n "$LG" ] && [ "$LG" != "None" ]; then
    echo "  Deleting: $LG"
    aws logs delete-log-group --log-group-name "$LG" \
      --region "$REGION" > /dev/null 2>&1 || true
  fi
done

echo ""
echo "=========================================="
echo "✅ Cleanup complete!"
echo "=========================================="
```

```bash
chmod +x final-phase/scripts/clean.sh
```

---

## 12. Step 9 — Write the GitHub Actions Pipeline

Create `.github/workflows/final-phase-pipeline.yml`:

```yaml
name: Final Phase Pipeline

# Manual trigger only — click "Run workflow" in GitHub Actions tab
# Each run creates new AWS resources with unique names
on:
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  TF_DIR: final-phase/terraform

jobs:

  # ─────────────────────────────────────────────────────────
  # PHASE 1: Tests
  # ─────────────────────────────────────────────────────────
  test:
    name: "Phase 1 — Tests"
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install root dependencies
        run: npm ci

      - name: Install server dependencies
        working-directory: server
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Push database schema
        run: npx prisma db push

      - name: Seed database
        run: node prisma/seed.js

      - name: Run tests
        run: npm test -- --reporter=json --outputFile=test-report.json || true

      - name: Upload test report
        uses: actions/upload-artifact@v4
        with:
          name: test-report
          path: test-report.json
          if-no-files-found: warn

  # ─────────────────────────────────────────────────────────
  # PHASE 2: Terraform Infrastructure
  # ─────────────────────────────────────────────────────────
  infrastructure:
    name: "Phase 2 — Terraform"
    runs-on: ubuntu-latest
    needs: test

    outputs:
      ecr_url:      ${{ steps.tf_out.outputs.ecr_url }}
      cluster_name: ${{ steps.tf_out.outputs.cluster_name }}
      stack_name:   ${{ steps.tf_out.outputs.stack_name }}
      s3_bucket:    ${{ steps.tf_out.outputs.s3_bucket }}

    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id:     ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-session-token:     ${{ secrets.AWS_SESSION_TOKEN }}
          aws-region:            ${{ secrets.AWS_REGION }}

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.9.0"

      - name: Terraform Init
        working-directory: ${{ env.TF_DIR }}
        run: terraform init

      - name: Terraform Validate
        working-directory: ${{ env.TF_DIR }}
        run: terraform validate

      - name: Terraform Plan
        working-directory: ${{ env.TF_DIR }}
        run: terraform plan -var="deploy_ecs_service=false" -out=tfplan

      - name: Terraform Apply
        working-directory: ${{ env.TF_DIR }}
        run: terraform apply -auto-approve tfplan

      - name: Read outputs
        id: tf_out
        working-directory: ${{ env.TF_DIR }}
        run: |
          echo "ecr_url=$(terraform output -raw ecr_repository_url)"    >> $GITHUB_OUTPUT
          echo "cluster_name=$(terraform output -raw ecs_cluster_name)" >> $GITHUB_OUTPUT
          echo "stack_name=$(terraform output -raw stack_name)"         >> $GITHUB_OUTPUT
          echo "s3_bucket=$(terraform output -raw s3_bucket_name)"      >> $GITHUB_OUTPUT

      - name: Save Terraform state
        uses: actions/upload-artifact@v4
        with:
          name: terraform-state
          path: ${{ env.TF_DIR }}/terraform.tfstate

  # ─────────────────────────────────────────────────────────
  # PHASE 3: Docker Build + ECS Deploy + Verify
  # ─────────────────────────────────────────────────────────
  deploy:
    name: "Phase 3 — Deploy"
    runs-on: ubuntu-latest
    needs: infrastructure

    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id:     ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-session-token:     ${{ secrets.AWS_SESSION_TOKEN }}
          aws-region:            ${{ secrets.AWS_REGION }}

      - name: Download Terraform state
        uses: actions/download-artifact@v4
        with:
          name: terraform-state
          path: ${{ env.TF_DIR }}

      - name: Log in to ECR
        run: |
          aws ecr get-login-password --region us-east-1 | \
            docker login --username AWS --password-stdin \
            ${{ needs.infrastructure.outputs.ecr_url }}

      - name: Build Docker image
        # --platform linux/amd64 is required for ECS Fargate (x86-64)
        run: |
          docker build \
            --platform linux/amd64 \
            -f final-phase/Dockerfile \
            -t shopsmart:latest \
            .

      - name: Push to ECR
        run: |
          docker tag shopsmart:latest ${{ needs.infrastructure.outputs.ecr_url }}:latest
          docker push ${{ needs.infrastructure.outputs.ecr_url }}:latest

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.9.0"

      - name: Terraform Init
        working-directory: ${{ env.TF_DIR }}
        run: terraform init

      - name: Deploy ECS service
        working-directory: ${{ env.TF_DIR }}
        run: |
          ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
          terraform apply -auto-approve \
            -var="deploy_ecs_service=true" \
            -var="container_image=${{ needs.infrastructure.outputs.ecr_url }}:latest" \
            -var="ecs_execution_role_arn=arn:aws:iam::${ACCOUNT_ID}:role/LabRole"

      - name: Wait for ECS service to stabilize
        run: |
          aws ecs wait services-stable \
            --cluster ${{ needs.infrastructure.outputs.cluster_name }} \
            --services ${{ needs.infrastructure.outputs.stack_name }}-service \
            --region us-east-1

      - name: Get public IP and verify health
        run: |
          CLUSTER="${{ needs.infrastructure.outputs.cluster_name }}"
          SERVICE="${{ needs.infrastructure.outputs.stack_name }}-service"

          TASK_ARN=$(aws ecs list-tasks \
            --cluster "$CLUSTER" --service-name "$SERVICE" \
            --region us-east-1 --query 'taskArns[0]' --output text)

          ENI_ID=$(aws ecs describe-tasks \
            --cluster "$CLUSTER" --tasks "$TASK_ARN" --region us-east-1 \
            --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
            --output text)

          PUBLIC_IP=$(aws ec2 describe-network-interfaces \
            --network-interface-ids "$ENI_ID" --region us-east-1 \
            --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

          echo "Public IP: $PUBLIC_IP"
          echo "Waiting 30s for container startup..."
          sleep 30
          curl -f "http://${PUBLIC_IP}:5001/api/health"
          echo ""
          echo "✅ App is live at: http://${PUBLIC_IP}:5001"
```

---

## 13. Step 10 — Test Everything Locally First

Always test locally before pushing. This saves you from discovering obvious mistakes after an 8-minute pipeline run.

### 10a. Configure AWS CLI (if not done already)

```bash
aws configure set aws_access_key_id     YOUR_KEY
aws configure set aws_secret_access_key YOUR_SECRET
aws configure set aws_session_token     YOUR_TOKEN
aws configure set default.region        us-east-1

aws sts get-caller-identity    # should print your account ID
```

### 10b. Initialize and apply Terraform (infrastructure only)

```bash
cd final-phase/terraform

terraform init
# Expected: "Terraform has been successfully initialized!"

terraform validate
# Expected: "Success! The configuration is valid."

terraform plan -var="deploy_ecs_service=false"
# Read through. Should show ~10 resources to create.

terraform apply -var="deploy_ecs_service=false"
# Type: yes
```

When complete, you'll see outputs:

```
ecr_repository_url = "443325993463.dkr.ecr.us-east-1.amazonaws.com/shopsmart-final-abc123-repo"
ecs_cluster_name   = "shopsmart-final-abc123-cluster"
s3_bucket_name     = "shopsmart-final-artifacts-xyz789ab"
stack_name         = "shopsmart-final-abc123"
```

Save the `ecr_repository_url` — you need it next.

### 10c. Build and push Docker image

Go back to the **root of the repo** (not inside final-phase/terraform):

```bash
cd /path/to/shopsmart   # repo root — important!

ECR_URL="443325993463.dkr.ecr.us-east-1.amazonaws.com/shopsmart-final-abc123-repo"
# ↑ replace with your actual ECR URL from terraform output

# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_URL

# Build — MUST include --platform linux/amd64 (especially on Mac M1/M2/M3)
docker build \
  --platform linux/amd64 \
  -f final-phase/Dockerfile \
  -t shopsmart:latest \
  .

# Tag and push
docker tag shopsmart:latest $ECR_URL:latest
docker push $ECR_URL:latest
```

The push shows layers being uploaded. Wait for the `latest: digest: sha256:...` line — that confirms success.

### 10d. Deploy ECS service

```bash
cd final-phase/terraform

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

terraform apply \
  -var="deploy_ecs_service=true" \
  -var="container_image=${ECR_URL}:latest" \
  -var="ecs_execution_role_arn=arn:aws:iam::${ACCOUNT_ID}:role/LabRole"
# Type: yes
```

### 10e. Get the public IP and test

```bash
CLUSTER="shopsmart-final-abc123-cluster"   # from terraform output
SERVICE="shopsmart-final-abc123-service"   # stack_name + "-service"

TASK_ARN=$(aws ecs list-tasks \
  --cluster $CLUSTER --service-name $SERVICE \
  --region us-east-1 --query 'taskArns[0]' --output text)

ENI_ID=$(aws ecs describe-tasks \
  --cluster $CLUSTER --tasks $TASK_ARN --region us-east-1 \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text)

PUBLIC_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids $ENI_ID --region us-east-1 \
  --query 'NetworkInterfaces[0].Association.PublicIp' --output text)

echo "Public IP: $PUBLIC_IP"
sleep 30   # wait for container to fully start
curl http://$PUBLIC_IP:5001/api/health
```

Expected response:

```json
{"status":"ok","message":"ShopSmart Backend is running","timestamp":"2026-05-03T19:23:50.077Z"}
```

If you see that — local deployment works. Now clean up before pushing to GitHub.

```bash
bash final-phase/scripts/clean.sh
```

---

## 14. Step 11 — Verify on AWS Console

After running Terraform locally (or after the pipeline runs), verify every resource on the AWS Console. Here's exactly what to click and what to look for.

### Access the AWS Console

1. AWS Academy → Learner Lab → click the **AWS** button (top left, next to the green dot)
2. Confirm the region selector (top right of AWS Console) shows **US East (N. Virginia) us-east-1**

---

### Check S3 — Bucket with versioning, encryption, no public access

1. Type **S3** in the AWS Console search bar → click **S3**
2. Look for a bucket named `shopsmart-final-artifacts-XXXXXXXX`
3. Click the bucket name
4. Click **Properties** tab:
   - Scroll to **Bucket Versioning** → should say ✅ `Enabled`
   - Scroll to **Default encryption** → should say ✅ `Amazon S3 managed keys (SSE-S3)`
5. Click **Permissions** tab:
   - **Block public access** → all four checkboxes should be ✅ `On`

What you want to see:
```
Bucket name:   shopsmart-final-artifacts-xyz789ab
Versioning:    Enabled
Encryption:    SSE-S3 (AES-256)
Public access: Block all (4 settings ON)
```

---

### Check ECR — Repository with your image

1. Search **ECR** → click **Elastic Container Registry**
2. Click **Repositories** (left sidebar)
3. Find `shopsmart-final-XXXXXX-repo` → click it
4. You should see an image with tag **`latest`**
5. Click the image to see details:
   - **OS/Arch:** `linux/amd64` (confirms platform flag worked)
   - **Pushed at:** a few minutes ago
   - **Scan status:** Complete (findings are normal — not a problem)

What you want to see:
```
Repository:  shopsmart-final-abc123-repo
Image tag:   latest
OS/Arch:     linux/amd64
```

---

### Check ECS — Cluster, service, running task

1. Search **ECS** → click **Elastic Container Service**
2. Click **Clusters** (left sidebar)
3. Find `shopsmart-final-XXXXXX-cluster` → click it
4. Click the **Services** tab:
   - Find `shopsmart-final-XXXXXX-service`
   - Check: **Desired tasks: 1**, **Running tasks: 1**, **Status: ACTIVE**
5. Click the service name
6. Click the **Tasks** tab → click the task ID
7. Under **Configuration** you'll see the **Public IP**
8. Under **Containers** → expand the container → click **View logs** to jump straight to CloudWatch

What you want to see:
```
Cluster:       shopsmart-final-abc123-cluster
Service:       shopsmart-final-abc123-service
Status:        ACTIVE
Desired:       1
Running:       1
```

---

### Check CloudWatch Logs — Container output

1. Search **CloudWatch** → click **CloudWatch**
2. Click **Log groups** (left sidebar)
3. Find `/ecs/shopsmart-final-XXXXXX`
4. Click it → click the latest log stream (named `ecs/shopsmart-server/...`)
5. Look for:
   ```
   Server running on port 5001
   ```

If you see errors here instead, they'll tell you exactly what's wrong. The most common ones are in the Troubleshooting section below.

---

### Hit the health endpoint

```bash
curl http://<YOUR_PUBLIC_IP>:5001/api/health
```

Or paste `http://<YOUR_PUBLIC_IP>:5001/api/health` into your browser.

Expected:
```json
{"status":"ok","message":"ShopSmart Backend is running","timestamp":"..."}
```

---

## 15. Step 12 — Push to GitHub and Trigger Pipeline

### Commit everything

```bash
# From root of your repo
git add final-phase/
git add .github/workflows/final-phase-pipeline.yml
git add prisma/schema.prisma

git status
# Confirm you see all the new files listed

git commit -m "feat: add final-phase pipeline — Terraform, Docker, ECS deployment"
git push origin main
```

### Trigger the pipeline

1. Go to your GitHub repo in the browser
2. Click the **Actions** tab (top of repo)
3. In the left sidebar, find **"Final Phase Pipeline"**
4. Click **"Run workflow"** button (right side of the page)
5. Leave branch as `main`
6. Click the green **"Run workflow"** button

The run appears in the list. Click on it to watch in real time.

**What you'll see:**

The pipeline runs 3 jobs in sequence. Each one must pass before the next starts.

| Job | Duration | Status means |
|-----|----------|-------------|
| Phase 1 — Tests | ~2 min | Tests ran, report uploaded |
| Phase 2 — Terraform | ~3 min | 10 AWS resources created |
| Phase 3 — Deploy | ~5 min | Image pushed, ECS running, health checked |

All green = success. Click any job to see individual step logs.

---

## 16. Step 13 — Verify Pipeline on AWS Console

After all three pipeline jobs show green checkmarks, do the same console verification from Step 11:

1. **S3** → bucket exists with versioning + encryption + blocked public access
2. **ECR** → repository exists with `latest` image tagged `linux/amd64`
3. **ECS** → cluster + service + 1 running task
4. **CloudWatch** → log group exists with `Server running on port 5001` in logs
5. **Health endpoint** → curl returns `{"status":"ok",...}`

The resource names will have a different random suffix than your local test run — that's expected.

---

## 17. Cleanup

### After local testing:

```bash
bash final-phase/scripts/clean.sh
```

### After GitHub Actions pipeline:

The pipeline doesn't auto-destroy. You have to clean up manually.

Run `clean.sh` — but note: it only destroys resources tracked by **local** Terraform state. Since the pipeline ran on GitHub's servers, there's no local state file. The script will still clean up via AWS CLI (ECR, ECS, S3, CloudWatch) by prefix `shopsmart-final-`.

```bash
bash final-phase/scripts/clean.sh
```

Or go to the AWS Console and manually delete:
1. ECS → Service → delete (set desired count to 0 first)
2. ECS → Cluster → delete
3. ECR → Repository → delete
4. S3 → Bucket → empty then delete
5. CloudWatch → Log group → delete
6. EC2 → Security groups → delete the `shopsmart-final-*` one

> Always clean up before running the pipeline again. Each run creates new resources with new random suffixes.

---

## 18. Troubleshooting

### `exec format error` in CloudWatch logs

```
exec /usr/local/bin/docker-entrypoint.sh: exec format error
```

**Cause:** Image built for ARM64 (Mac M1/M2/M3), ECS needs AMD64.

**Fix:** Add `--platform linux/amd64` to the build command:

```bash
docker build --platform linux/amd64 -f final-phase/Dockerfile -t shopsmart:latest .
```

---

### `PrismaClientInitializationError: could not locate Query Engine for debian-openssl-3.0.x`

**Cause:** `prisma/schema.prisma` missing `binaryTargets`.

**Fix:** Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

Rebuild and redeploy.

---

### `curl: (28) Failed to connect` — port 5001 timeout

**Diagnose first:**

```bash
aws logs tail /ecs/shopsmart-final-XXXXXX --follow --region us-east-1
```

Then:
1. If logs show errors → fix the error (usually Prisma or missing env var)
2. If logs show `Server running on port 5001` → wait longer, the container just started
3. If no log stream exists → task never started; check ECS service events in console

---

### GitHub Actions fails with `ExpiredTokenException`

**Cause:** AWS Academy tokens expire when the lab session ends.

**Fix:**
1. AWS Academy → Start Lab → AWS Details → copy fresh credentials
2. GitHub → Settings → Secrets → Actions → update:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN`
3. Re-trigger the pipeline

---

### Terraform fails with `AlreadyExistsException` or `already exists`

**Cause:** Previous run left resources. Local state and pipeline state are separate files.

**Fix:**

```bash
bash final-phase/scripts/clean.sh
```

---

### `InvalidParameterException: taskId length should be one of [32,36]`

**Cause:** Ran IP lookup before the new task started — `list-tasks` returned empty string.

**Fix:** Wait 30-60 seconds and retry:

```bash
aws ecs list-tasks \
  --cluster YOUR_CLUSTER \
  --service-name YOUR_SERVICE \
  --region us-east-1
```

Once a taskArn appears, run the IP lookup.

---

## 19. What If Your Repo Is Different?

This guide is for ShopSmart where:
- Backend: `server/` folder
- Prisma: `prisma/` at root
- Entry point: `server/src/index.js`
- Port: `5001`
- Health endpoint: `/api/health`

If your repo has a different structure, change these specific things:

| Your repo difference | What to change |
|---------------------|---------------|
| No Prisma / different ORM | Remove the `npx prisma generate`, `db push`, `seed.js` lines from Dockerfile and pipeline |
| Prisma is inside `server/prisma/` | Change `COPY prisma/ ./prisma/` → `COPY server/prisma/ ./prisma/` in Dockerfile |
| Different port (e.g. 3000) | Change `EXPOSE 5001` → `EXPOSE 3000`, update security group ports in `main.tf`, update healthcheck URL |
| Different health endpoint | Change `/api/health` in `HEALTHCHECK` and `main.tf` healthCheck command |
| Different entry point | Change `CMD ["node", "src/index.js"]` to your actual entry point |
| Has a frontend to deploy too | Add a separate job to build and deploy the frontend — ECS only handles the backend |
| Different test command | Change `npm test` in the pipeline Phase 1 step |

**Quick self-check prompts — answer these about your own repo before writing the Dockerfile:**

1. What folder is my backend in?
2. What command starts my server? (`node src/index.js`? `npm start`? something else?)
3. What port does it listen on?
4. Is there a health check endpoint? What's the path?
5. Where is my `package.json`?
6. Do I use Prisma? Where is `schema.prisma`?
7. How do I run tests? (`npm test`? `npm run test:unit`?)
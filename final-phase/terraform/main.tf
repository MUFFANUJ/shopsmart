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

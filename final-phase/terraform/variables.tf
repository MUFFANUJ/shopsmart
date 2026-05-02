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
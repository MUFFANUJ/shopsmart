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
